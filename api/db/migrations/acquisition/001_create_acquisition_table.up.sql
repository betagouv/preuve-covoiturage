CREATE TABLE IF NOT EXISTS acquisition.acquisitions
(
  _id serial primary key,
  application_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  journey_id varchar NOT NULL,
  payload json NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX on acquisition.acquisitions (operator_id, journey_id);
