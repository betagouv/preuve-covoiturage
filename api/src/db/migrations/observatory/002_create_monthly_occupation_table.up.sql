CREATE TYPE observatory.monthly_occupation_type_enum AS enum('arr', 'com', 'epci', 'aom', 'dep', 'reg', 'country');

CREATE TABLE IF NOT EXISTS observatory.monthly_occupation (
  id SERIAL PRIMARY KEY,
  year smallint NOT NULL,
  month smallint NOT NULL,
  type observatory.monthly_occupation_type_enum NOT NULL,
  territory varchar(9) NOT NULL,
  l_territory varchar NOT NULL,
  journeys integer NOT NULL,
  trips integer NOT NULL,
  has_incentive integer NOT NULL,
  occupation_rate float NOT NULL,
  geom json NOT NULL
);

CREATE INDEX IF NOT EXISTS monthly_occupation_id_index ON observatory.monthly_occupation USING btree (id);

ALTER TABLE observatory.monthly_occupation ADD CONSTRAINT monthly_occupation_unique_key UNIQUE (year,month,type,territory);