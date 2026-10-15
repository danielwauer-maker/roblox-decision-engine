-- Stripe webhook deduplication and invoice state. Apply before starting an API
-- version that writes these fields against an existing PostgreSQL database.
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS last_invoice_id VARCHAR(160),
    ADD COLUMN IF NOT EXISTS last_invoice_status VARCHAR(32),
    ADD COLUMN IF NOT EXISTS last_payment_failed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(160) NOT NULL UNIQUE,
    event_type VARCHAR(120) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_stripe_webhook_events_event_type
    ON stripe_webhook_events (event_type);
