ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_consumed_at TIMESTAMPTZ NULL;
ALTER TABLE pilot_lifecycle ADD COLUMN IF NOT EXISTS pilot_consumed_at TIMESTAMPTZ NULL;
UPDATE pilot_lifecycle SET pilot_consumed_at = started_at WHERE pilot_consumed_at IS NULL;
CREATE TABLE IF NOT EXISTS decision_credit_usage (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  request_key VARCHAR(160) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT uq_decision_credit_request UNIQUE (organization_id, request_key)
);
CREATE INDEX IF NOT EXISTS ix_decision_credit_usage_organization_id ON decision_credit_usage (organization_id);
CREATE INDEX IF NOT EXISTS ix_decision_credit_usage_period_start ON decision_credit_usage (period_start);
