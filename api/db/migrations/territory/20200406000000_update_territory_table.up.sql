ALTER TABLE territory.territories RENAME TO territories_old;

CREATE TYPE territory.territory_level_enum AS ENUM(
  'town',
  'towngroup',
  'district',
  'megalopolis',
  'region',
  'state',
  'country',
  'countrygroup',
  'other'
);

CREATE TYPE territory.territory_level_name AS (
    level territory.territory_level_enum,
    name varchar(128)
);

CREATE TABLE IF NOT EXISTS territory.territories
(
    _id serial primary key,
    company_id integer REFERENCES company.companies(_id) ON DELETE SET NULL,

    --- timestamps
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    deleted_at timestamp with time zone,

    --- general
    level territory.territory_level_enum NOT NULL,
    name varchar(128),
    shortname varchar(128),

    --- registry
    activable boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT false,
    active_since timestamp with time zone,
    contacts json,
    address json,

    --- geo data
    density integer,
    geo geography,

    -- ui_status
    ui_status json,


    --- for migration
    old_territory_id int,
    old_insee_id varchar
);

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
CREATE INDEX ON territory.territories (_id);
CREATE INDEX ON territory.territories USING GIST (geo);

--- insee, postcode
--- TODO:  create custom type for "type" ?
CREATE TABLE IF NOT EXISTS territory.territory_codes (
    _id serial primary key,
    territory_id integer NOT NULL REFERENCES territory.territories (_id) ON DELETE CASCADE,
    type varchar(10) NOT NULL,
    value varchar(64) NOT NULL,
    UNIQUE(territory_id, type, value)
);
CREATE INDEX territory_codes_territory_id_idx ON territory.territory_codes(territory_id);
CREATE INDEX territory_codes_type_value_idx ON territory.territory_codes(type, value);

CREATE TABLE IF NOT EXISTS territory.territory_relation (
    _id serial primary key,
    parent_territory_id integer NOT NULL REFERENCES territory.territories (_id) ON DELETE CASCADE,
    child_territory_id integer NOT NULL REFERENCES territory.territories (_id) ON DELETE CASCADE,
    UNIQUE(parent_territory_id, child_territory_id)
);
CREATE INDEX territory_relation_parent_territory_id_idx ON territory.territory_relation(parent_territory_id);
CREATE INDEX territory_relation_child_territory_id_idx ON territory.territory_relation(child_territory_id);
