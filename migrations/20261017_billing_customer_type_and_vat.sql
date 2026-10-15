ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_type VARCHAR(16);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS company_name VARCHAR(240);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_country VARCHAR(2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_tax_id_id VARCHAR(160);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tax_id_last4 VARCHAR(4);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tax_id_verification_status VARCHAR(24);
