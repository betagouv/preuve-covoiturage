create type fraudchecks_status as enum('pending', 'done', 'error');
create type fraudchecks_method as enum('example');

CREATE TABLE fraudchecks
(
  _id serial primary key,

  acquisition_id varchar NOT NULL,
  method fraudchecks_method NOT NULL,

  status fraudchecks_status NOT NULL,
  meta: json,
  karma int DEFAULT 0,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE UNIQUE INDEX ON fraudchecks(acquisition_id, method);
