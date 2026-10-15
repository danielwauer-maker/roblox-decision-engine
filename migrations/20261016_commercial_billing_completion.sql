-- Non-destructive state required for self-service plan changes and standard trial signup.
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_source VARCHAR(32) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_trial_consumed_at TIMESTAMPTZ NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pending_plan_id VARCHAR(32) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pending_plan_effective_at TIMESTAMPTZ NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS pending_plan_change_type VARCHAR(24) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_schedule_id VARCHAR(160) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_change_request_key VARCHAR(160) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(160) NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(160) NULL;

CREATE TABLE IF NOT EXISTS standard_trial_signups (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    contact_name VARCHAR(160) NOT NULL,
    studio_name VARCHAR(160) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_standard_trial_signups_email ON standard_trial_signups (email);
CREATE INDEX IF NOT EXISTS ix_standard_trial_signups_expires_at ON standard_trial_signups (expires_at);
