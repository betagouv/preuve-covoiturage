CREATE TYPE fraudcheck.status_enum as enum('pending', 'done', 'error');

CREATE TABLE IF NOT EXISTS fraudcheck.fraudchecks
(
  _id serial primary key,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp,

  acquisition_id varchar NOT NULL,
  method varchar(128) NOT NULL,

  status fraudcheck.status_enum NOT NULL DEFAULT 'pending',

  karma int DEFAULT 0,
  meta json
);

CREATE INDEX ON fraudcheck.fraudchecks(acquisition_id);
CREATE INDEX ON fraudcheck.fraudchecks(method);
CREATE INDEX ON fraudcheck.fraudchecks(status);

CREATE UNIQUE INDEX ON fraudcheck.fraudchecks(acquisition_id, method);

CREATE TRIGGER touch_fraudchecks_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
