CREATE TABLE IF NOT EXISTS fraudcheck.labels
(
  _id serial primary key,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  carpool_id integer NOT NULL REFERENCES carpool.carpools(_id),
  label varchar NOT NULL,
  geo_code varchar(9)
);

CREATE UNIQUE INDEX on fraudcheck.labels (carpool_id, label);