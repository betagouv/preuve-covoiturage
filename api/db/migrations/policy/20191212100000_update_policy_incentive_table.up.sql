ALTER TABLE policy.incentives
  DROP COLUMN acquisition_id,
  DROP COLUMN payment_id,
  ADD COLUMN carpool varchar NOT NULL,
  ADD COLUMN amount integer NOT NULL DEFAULT 0;