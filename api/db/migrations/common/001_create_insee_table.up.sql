CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS common.insee
(
  _id varchar primary key,
  territory_id  varchar, -- integer REFERENCES territories (_id) NOT NULL,
  regional_territory_id varchar, -- integer REFERENCES territories (_id) NOT NULL,
  geo geography NOT NULL
  -- postcode
  -- town
  -- country
);

CREATE INDEX ON common.insee USING GIST (geo);