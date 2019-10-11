CREATE TYPE carpool_identity AS (
  phone varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  company varchar,
  travel_pass_name varchar,
  travel_user_id varchar,
  over_18 boolean
);

CREATE TABLE carpools
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  trip_id varchar,

  identity carpool_identity,
  is_driver boolean NOT NULL,
  operator_class char NOT NULL,

  datetime timestamp with time zone NOT NULL,
  duration int NOT NULL,

  start_position geography(POINT) NOT NULL,
  start_insee varchar NOT NULL,

  end_position geography(POINT) NOT NULL,
  end_insee varchar NOT NULL,

  distance int NOT NULL,
  seats int NOT NULL default 1
);

CREATE INDEX ON carpools (acquisition_id);
CREATE INDEX ON carpools (operator_id);
CREATE INDEX ON carpools (trip_id);

CREATE INDEX ON carpools (((identity).phone));
CREATE INDEX ON carpools (operator_class);

CREATE INDEX ON carpools (datetime);
CREATE INDEX ON carpools (start_insee);
CREATE INDEX ON carpools (end_insee);

CREATE INDEX ON carpools (distance);
