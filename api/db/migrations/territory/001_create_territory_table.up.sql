CREATE TABLE IF NOT EXISTS territory.territories
(
  _id serial primary key,
  parent_id integer REFERENCES territory.territories (_id),

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  deleted_at timestamp with time zone,

  siret varchar NOT NULL,
  name varchar NOT NULL,
  shortname varchar,

  cgu_accepted_at timestamp with time zone,
  cgu_accepted_by varchar,

  company json NOT NULL,
  address json NOT NULL,
  contacts json NOT NULL
);

CREATE INDEX ON territory.territories (siret);
-- CREATE UNIQUE INDEX ON territory.territories (siret);

CREATE TABLE IF NOT EXISTS territory.insee (
  _id varchar primary key,
  territory_id integer REFERENCES territory.territories (_id) NOT NULL
);

CREATE INDEX ON territory.insee (territory_id);

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
