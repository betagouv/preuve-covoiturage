-- Create the new table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS carpool.identities
(
  _id serial primary key,
  uuid uuid NOT NULL DEFAULT uuid_generate_v4(),

  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),

  phone varchar,
  phone_trunc varchar,
  operator_user_id varchar,

  firstname varchar,
  lastname varchar,
  email varchar,
  company varchar,
  
  travel_pass_name varchar,
  travel_pass_user_id varchar,
  over_18 boolean
);

CREATE INDEX ON carpool.identities (uuid);
CREATE INDEX ON carpool.identities (phone);
CREATE INDEX ON carpool.identities (phone_trunc, operator_user_id);

CREATE TRIGGER touch_identities_updated_at BEFORE UPDATE ON carpool.identities FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

-- Add identity_id column to carpools table
ALTER TABLE carpool.carpools
  DROP COLUMN identity,
  ADD COLUMN identity_id integer NOT NULL;

CREATE INDEX ON carpool.carpools (identity_id);

-- Drop the obsolete TYPE
DROP TYPE carpool.identity CASCADE;
