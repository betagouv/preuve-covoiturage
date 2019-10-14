CREATE TABLE IF NOT EXISTS acquisition.acquisitions
(
  _id serial primary key,
  application_id varchar NOT NULL,
  operator_id varchar NOT NULL,
  payload json NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);
