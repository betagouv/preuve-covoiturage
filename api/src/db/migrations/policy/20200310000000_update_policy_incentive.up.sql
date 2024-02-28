CREATE TYPE policy.incentive_state_enum AS enum('regular', 'null', 'disabled');

ALTER TABLE policy.incentives
  ADD COLUMN datetime timestamp WITH time zone,
  ADD COLUMN result integer NOT NULL DEFAULT 0,
  ADD COLUMN state policy.incentive_state_enum NOT NULL DEFAULT 'regular';

UPDATE policy.incentives pi SET datetime = cc.datetime FROM carpool.carpools cc WHERE cc._id = pi.carpool_id::int;

ALTER TABLE policy.incentives
  ALTER COLUMN datetime SET NOT NULL;

CREATE INDEX IF NOT EXISTS incentives_carpool_id_idx  ON policy.incentives(carpool_id);
CREATE INDEX IF NOT EXISTS incentives_policy_id_idx  ON policy.incentives(policy_id);
CREATE UNIQUE INDEX IF NOT EXISTS incentives_policy_id_carpool_id_idx ON policy.incentives(policy_id, carpool_id);
CREATE INDEX IF NOT EXISTS incentives_datetime_idx ON policy.incentives(datetime);
CREATE INDEX IF NOT EXISTS incentives_state_idx ON policy.incentives(state);

CREATE INDEX IF NOT EXISTS policies_territory_id_idx ON policy.policies(territory_id);