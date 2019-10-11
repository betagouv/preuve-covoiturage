CREATE TYPE acquisition_status_enum AS enum('pending', 'done', 'error');

CREATE TABLE acquisitions
(
  _id serial primary key,
  application_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  payload json NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE acquisition_status
(
  acquisition_id integer REFERENCES acquisitions (_id),
  status acquisition_status_enum NOT NULL,
  meta json,
);
-- pas sûr que le status soit utile