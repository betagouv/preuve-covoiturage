CREATE TABLE applications
(
  _id serial primary key,
  operator_id varchar NOT NULL,
  name varchar NOT NULL,
  roles varchar[],
  created_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE INDEX ON applications (operator_id);
