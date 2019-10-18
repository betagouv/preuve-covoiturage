CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS common.insee
(
  _id varchar primary key,
  territory_id  varchar, -- integer REFERENCES territories (_id) NOT NULL,
  parent_territory_id varchar, -- integer REFERENCES territories (_id) NOT NULL,
  geo geography NOT NULL,
  density integer,
  postcodes varchar(10)[],
  town varchar(64),
  country varchar(32)
);

CREATE INDEX ON common.insee USING GIST (geo);