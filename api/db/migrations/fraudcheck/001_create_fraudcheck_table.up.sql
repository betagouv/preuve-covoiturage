CREATE TYPE fraudcheck.status_enum as enum('pending', 'done', 'error');
CREATE TYPE fraudcheck.method_enum as enum('example');

CREATE TABLE IF NOT EXISTS fraudcheck.fraudchecks
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  method fraudcheck.method_enum NOT NULL,

  status fraudcheck.status_enum NOT NULL,
  meta json,
  karma int DEFAULT 0,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE INDEX ON fraudcheck.fraudchecks(acquisition_id);
CREATE INDEX ON fraudcheck.fraudchecks(method);
CREATE INDEX ON fraudcheck.fraudchecks(status);

CREATE UNIQUE INDEX ON fraudcheck.fraudchecks(acquisition_id, method);