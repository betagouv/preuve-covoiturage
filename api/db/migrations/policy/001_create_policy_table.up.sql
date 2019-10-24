CREATE TYPE policy.policy_status_enum AS enum('template', 'draft', 'active', 'finished');
CREATE TYPE policy.policy_unit_enum AS enum('euro', 'point');

CREATE TABLE IF NOT EXISTS policy.policies
(
  _id serial primary key,
  parent_id integer REFERENCES policy.policies (_id),
  territory_id varchar,

  start_date timestamp,
  end_date timestamp,

  name varchar NOT NULL,
  description varchar,

  unit policy.policy_unit_enum NOT NULL,
  status policy.policy_status_enum NOT NULL,

  global_rules json,
  rules json,
  ui_status json,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);
