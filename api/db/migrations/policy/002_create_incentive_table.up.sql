CREATE TYPE policy.incentive_status_enum AS enum('draft', 'validated', 'warning', 'error');

CREATE TABLE IF NOT EXISTS policy.incentives
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  policy_id varchar NOT NULL,
  payment_id varchar,

  meta json,
  status policy.incentive_status_enum NOT NULL
);

CREATE INDEX ON policy.incentives (acquisition_id);
CREATE INDEX ON policy.incentives (policy_id);
CREATE INDEX ON policy.incentives (payment_id);
CREATE INDEX ON policy.incentives (status);
