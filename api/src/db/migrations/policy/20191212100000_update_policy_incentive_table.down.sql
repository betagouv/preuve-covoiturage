ALTER TABLE policy.incentives
  DROP COLUMN carpool,
  DROP COLUMN amount,
  ADD COLUMN acquisition_id varchar NOT NULL,
  ADD COLUMN payment_id varchar NOT NULL;