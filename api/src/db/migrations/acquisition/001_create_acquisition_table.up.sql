CREATE TABLE IF NOT EXISTS acquisition.acquisitions
(
  _id serial primary key,

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),

  application_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  journey_id varchar NOT NULL,

  payload json NOT NULL
);

CREATE UNIQUE INDEX on acquisition.acquisitions (operator_id, journey_id);
