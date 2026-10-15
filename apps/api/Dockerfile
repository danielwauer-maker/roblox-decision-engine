FROM python:3.12-slim
WORKDIR /app
COPY apps/api/pyproject.toml ./pyproject.toml
RUN python -m pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -e .
COPY apps/api/app ./app
COPY apps/shared ./shared
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
