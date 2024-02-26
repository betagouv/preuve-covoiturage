CREATE TYPE observatory.monthly_flux_type_enum AS enum('arr', 'com', 'epci', 'aom', 'dep', 'reg', 'country');

CREATE TABLE IF NOT EXISTS observatory.monthly_flux (
  id SERIAL PRIMARY KEY,
  year smallint NOT NULL,
  month smallint NOT NULL,
  type observatory.monthly_flux_type_enum NOT NULL,
  territory_1 varchar(9) NOT NULL,
  l_territory_1 varchar NOT NULL,
  lng_1 float NOT NULL,
  lat_1 float NOT NULL,
  territory_2 varchar(9) NOT NULL,
  l_territory_2 varchar NOT NULL,
  lng_2 float NOT NULL,
  lat_2 float NOT NULL,
  journeys integer NOT NULL,
  has_incentive integer NOT NULL,
  passengers integer NOT NULL,
  distance float NOT NULL,
  duration float NOT NULL
);

CREATE INDEX IF NOT EXISTS monthly_flux_id_index ON observatory.monthly_flux USING btree (id);

ALTER TABLE observatory.monthly_flux ADD CONSTRAINT monthly_flux_unique_key UNIQUE (year,month,type,territory_1,territory_2);