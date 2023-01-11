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
  h0 integer NOT NULL,
  h1 integer NOT NULL,
  h2 integer NOT NULL,
  h3 integer NOT NULL,
  h4 integer NOT NULL,
  h5 integer NOT NULL,
  h6 integer NOT NULL,
  h7 integer NOT NULL,
  h8 integer NOT NULL,
  h9 integer NOT NULL,
  h10 integer NOT NULL,
  h11 integer NOT NULL,
  h12 integer NOT NULL,
  h13 integer NOT NULL,
  h14 integer NOT NULL,
  h15 integer NOT NULL,
  h16 integer NOT NULL,
  h17 integer NOT NULL,
  h18 integer NOT NULL,
  h19 integer NOT NULL,
  h20 integer NOT NULL,
  h21 integer NOT NULL,
  h22 integer NOT NULL,
  h23 integer NOT NULL,
  dist_0_10 integer NOT NULL,
  dist_10_20 integer NOT NULL,
  dist_20_30 integer NOT NULL,
  dist_30_40 integer NOT NULL,
  dist_40_50 integer NOT NULL,
  dist_more50 integer NOT NULL
);

CREATE INDEX IF NOT EXISTS monthly_distribution_id_index ON observatory.monthly_distribution USING btree (id);

ALTER TABLE observatory.monthly_distribution ADD CONSTRAINT monthly_distribution_unique_key UNIQUE (year,month,territory,type,direction);