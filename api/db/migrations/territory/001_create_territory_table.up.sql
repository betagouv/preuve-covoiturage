CREATE TABLE IF NOT EXISTS territory.territories
(
  _id serial primary key,
  parent_id integer REFERENCES territory.territories (_id),

  siret varchar NOT NULL,
  name varchar NOT NULL,
  shortname varchar,

  company json NOT NULL,
  address json NOT NULL,
  contacts json NOT NULL,

  cgu_accepted_at timestamp,
  cgu_accepted_by varchar,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE UNIQUE INDEX ON territory.territories (siret);

CREATE TABLE IF NOT EXISTS territory.insee (
  _id varchar primary key,
  territory_id integer REFERENCES territory.territories (_id) NOT NULL
);

CREATE INDEX ON territory.insee (territory_id);
