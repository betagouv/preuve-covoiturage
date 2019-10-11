CREATE TYPE policy_status_enum AS enum('template', 'draft', 'active', 'finished');
CREATE TYPE policy_unit_enum AS enum('euro', 'point');

CREATE TABLE policies
(
  _id serial primary key,
  parent_id integer REFERENCES policies (_id),
  territory_id varchar,

  start timestamp,
  end timestamp,

  name varchar NOT NULL,
  description varchar,

  unit policy_unit_enum NOT NULL,
  status policy_status_enum NOT NULL,

  global_rules json,
  rules json,
  meta json,
  ui_status json,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
);
