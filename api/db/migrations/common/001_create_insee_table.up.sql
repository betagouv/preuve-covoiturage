CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS common.insee
(
  _id varchar primary key,

  town varchar(64),
  country varchar,

  density integer,

  postcodes varchar(10)[],
  geo geography
);

CREATE INDEX ON common.insee USING GIST (geo);
