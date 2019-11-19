DROP TRIGGER IF EXISTS touch_identities_updated_at ON carpool.identities;
DROP TABLE IF EXISTS carpool.identities;

-- Recreate type and switch identity columns
CREATE TYPE carpool.identity AS (
  phone varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  company varchar,
  travel_pass_name varchar,
  travel_user_id varchar,
  over_18 boolean
);

ALTER TABLE carpool.carpools
  ADD COLUMN identity carpool.identity,
  DROP COLUMN identity_id;

CREATE INDEX ON carpool.carpools (((identity).phone));
