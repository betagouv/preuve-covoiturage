CREATE TABLE territories
(
  _id serial primary key,
  parent_id integer REFERENCES territories (_id),

  siret varchar NOT NULL,
  name varchar NOT NULL,
  shortname varchar,
  accronym varchar,
  
  company json NOT NULL,
  address json NOT NULL,
  contacts json NOT NULL,
  
  cgu_accepted_at timestamp,
  cgu_accepted_by varchar,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE TABLE insee
(
  _id varchar primary key,
  territory_id integer REFERENCES territories (_id) NOT NULL,
  regional_territory_id integer REFERENCES territories (_id) NOT NULL,
  geo geography NOT NULL
  -- postcode
  -- town
  -- country
);

CREATE INDEX ON insee USING GIST (geo);
CREATE UNIQUE INDEX ON territories (siret);