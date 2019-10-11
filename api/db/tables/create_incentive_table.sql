CREATE TYPE incentives_status_enum AS enum('draft', 'validated', 'warning', 'error');

CREATE TABLE incentives
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  policy_id varchar NOT NULL,
  payment_id varchar,

  meta json,
  status incentives_status_enum NOT NULL,
);

CREATE INDEX ON incentives (acquisition_id);
CREATE INDEX ON incentives (policy_id);
CREATE INDEX ON incentives (payment_id);
CREATE INDEX ON incentives (status);
