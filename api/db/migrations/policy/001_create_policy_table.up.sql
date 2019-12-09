CREATE TYPE policy.policy_status_enum AS enum('template', 'draft', 'active', 'finished');
CREATE TYPE policy.policy_unit_enum AS enum('euro', 'point');

CREATE TABLE IF NOT EXISTS policy.policies
(
  _id serial primary key,

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  deleted_at timestamp with time zone,

  parent_id integer, -- REFERENCES policy.policies (_id),
  territory_id varchar,

  start_date timestamp with time zone,
  end_date timestamp with time zone,

  name varchar NOT NULL,
  description varchar,

  unit policy.policy_unit_enum NOT NULL,
  status policy.policy_status_enum NOT NULL,

  global_rules json,
  rules json,
  ui_status json
);

CREATE TRIGGER touch_policies_updated_at BEFORE UPDATE ON policy.policies FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
