"""Apply local PostgreSQL migrations in order; production databases are refused."""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))

import app.main  # noqa: F401 -- registers all model metadata
from app.config import get_settings
from app.db import Base, engine


def main() -> int:
    settings = get_settings()
    if settings.app_env.lower() not in {"development", "test"}:
        raise SystemExit("Refusing migrations: APP_ENV must be development or test")
    host = make_url(settings.database_url).host
    if host not in {"localhost", "127.0.0.1", "::1", "postgres", "db"}:
        raise SystemExit("Refusing migrations: database host is not a known local development host")

    files = sorted((ROOT / "migrations").glob("*.sql"))
    if not files:
        print("No SQL migrations found.")
        return 0

    try:
        with engine.begin() as connection:
            Base.metadata.create_all(bind=connection)
            connection.execute(text(
                "CREATE TABLE IF NOT EXISTS schema_migrations ("
                "version VARCHAR(255) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, "
                "applied_at TIMESTAMPTZ NOT NULL DEFAULT now())"
            ))
            for path in files:
                sql = path.read_text(encoding="utf-8")
                checksum = hashlib.sha256(sql.encode("utf-8")).hexdigest()
                row = connection.execute(
                    text("SELECT checksum FROM schema_migrations WHERE version = :version"),
                    {"version": path.name},
                ).first()
                if row:
                    if row.checksum != checksum:
                        raise SystemExit(f"Refusing changed migration already applied: {path.name}")
                    print(f"Already applied: {path.name}")
                    continue
                connection.exec_driver_sql(sql)
                connection.execute(
                    text("INSERT INTO schema_migrations (version, checksum) VALUES (:version, :checksum)"),
                    {"version": path.name, "checksum": checksum},
                )
                print(f"Applied: {path.name}")

            inspector = inspect(connection)
            missing_columns = []
            for table_name, table in Base.metadata.tables.items():
                present = {column["name"] for column in inspector.get_columns(table_name)}
                missing_columns.extend(
                    f"{table_name}.{column.name}"
                    for column in table.columns
                    if column.name not in present
                )
            if missing_columns:
                raise RuntimeError("Schema is missing model columns: " + ", ".join(missing_columns))
    except SQLAlchemyError as error:
        print(
            f"Migration failed ({type(error).__name__}); the local database may be unavailable. "
            "No live/production database was targeted.",
            file=sys.stderr,
        )
        return 2
    print("Local schema is current.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
