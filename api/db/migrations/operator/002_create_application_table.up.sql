CREATE TABLE IF NOT EXISTS operator.applications
(
  _id serial primary key,
  operator_id varchar NOT NULL,
  name varchar NOT NULL,
  roles varchar[],
  created_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE INDEX ON operator.applications (operator_id);
