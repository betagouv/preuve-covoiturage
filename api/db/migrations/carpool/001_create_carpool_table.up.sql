CREATE EXTENSION IF NOT EXISTS postgis;

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

CREATE TABLE IF NOT EXISTS carpool.carpools
(
  _id serial primary key,

  created_at timestamp NOT NULL DEFAULT NOW(),

  acquisition_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  trip_id varchar NOT NULL,
  operator_trip_id varchar,

  identity carpool.identity,
  is_driver boolean NOT NULL,
  operator_class char NOT NULL,

  datetime timestamp with time zone NOT NULL,
  duration int NOT NULL,

  start_position geography NOT NULL,
  start_insee varchar NOT NULL,
  start_town varchar, -- TODO: try to drop this
  start_territory varchar, -- TODO: drop this

  end_position geography NOT NULL,
  end_insee varchar NOT NULL,
  end_town varchar, -- TODO: try drop this
  end_territory varchar, -- TODO: drop this

  distance int NOT NULL,
  seats int NOT NULL default 1
);

CREATE INDEX ON carpool.carpools (acquisition_id);
CREATE INDEX ON carpool.carpools (operator_id);
CREATE INDEX ON carpool.carpools (trip_id);

CREATE INDEX ON carpool.carpools (((identity).phone));
CREATE INDEX ON carpool.carpools (operator_class);

CREATE INDEX ON carpool.carpools (datetime);
CREATE INDEX ON carpool.carpools (distance);

CREATE INDEX ON carpool.carpools (start_insee);
CREATE INDEX ON carpool.carpools (start_town);
CREATE INDEX ON carpool.carpools (start_territory);

CREATE INDEX ON carpool.carpools (end_insee);
CREATE INDEX ON carpool.carpools (end_town);
CREATE INDEX ON carpool.carpools (end_territory);
