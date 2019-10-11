create type fraudchecks_status_enum as enum('pending', 'done', 'error');
create type fraudchecks_method_enum as enum('example');

CREATE TABLE fraudchecks
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  method fraudchecks_method_enum NOT NULL,

  status fraudchecks_status_enum NOT NULL,
  meta: json,
  karma int DEFAULT 0,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE UNIQUE INDEX ON fraudchecks(acquisition_id);
CREATE UNIQUE INDEX ON fraudchecks(method);
CREATE UNIQUE INDEX ON fraudchecks(status);
CREATE UNIQUE INDEX ON fraudchecks(acquisition_id, method);