DROP INDEX IF EXISTS policy.incentives_carpool_id_idx;
DROP INDEX IF EXISTS policy.incentives_policy_id_carpool_id_idx;
DROP INDEX IF EXISTS policy.incentives_policy_id_idx;
DROP INDEX IF EXISTS policy.incentives_datetime_idx;
DROP INDEX IF EXISTS policy.incentives_state_idx;
DROP INDEX IF EXISTS policy.policies_territory_id_idx;

ALTER TABLE policy.incentives
  DROP COLUMN datetime,
  DROP COLUMN result,
  DROP COLUMN state;

DROP TYPE policy.incentive_state_enum;

