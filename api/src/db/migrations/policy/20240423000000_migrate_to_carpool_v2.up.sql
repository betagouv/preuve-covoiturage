ALTER TABLE policy.incentives
  ADD COLUMN operator_id INTEGER REFERENCES operator.operators(_id),
  ADD operator_journey_id VARCHAR;

CREATE UNIQUE INDEX IF NOT EXISTS policy_incentives_operator_operator_journey_id_idx ON policy.incentives (operator_id, operator_journey_id);
