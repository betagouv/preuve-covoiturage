CREATE TYPE observatory.monthly_distribution_type_enum AS enum('arr', 'com', 'epci', 'aom', 'dep', 'reg', 'country');
CREATE TYPE observatory.monthly_distribution_direction_enum AS enum('from', 'to');


CREATE TABLE IF NOT EXISTS observatory.monthly_distribution (
  id SERIAL PRIMARY KEY,
  year smallint NOT NULL,
  month smallint NOT NULL,
  territory varchar(9) NOT NULL,
  l_territory varchar NOT NULL,
  type observatory.monthly_distribution_type_enum NOT NULL,
  direction observatory.monthly_distribution_direction_enum NOT NULL,
  hours json NOT NULL,
  distances json NOT NULL
);

CREATE INDEX IF NOT EXISTS monthly_distribution_id_index ON observatory.monthly_distribution USING btree (id);

ALTER TABLE observatory.monthly_distribution ADD CONSTRAINT monthly_distribution_unique_key UNIQUE (year,month,territory,type,direction);