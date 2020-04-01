ALTER TABLE territory.territories RENAME TO territories_old;

CREATE TYPE territory.territory_level_enum AS ENUM('town', 'intertown', 'district', 'department', 'region', 'country', 'other');

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

    --- registry
    active boolean NOT NULL DEFAULT false,
    active_since timestamp with time zone,
    contacts json,

    --- geo data
    density integer,
    geo geography,

    --- for migration
    old_territory_id int,
    old_insee_id varchar
);

CREATE TRIGGER touch_territories_updated_at BEFORE UPDATE ON territory.territories FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
CREATE INDEX ON territory.territories (_id);
CREATE INDEX ON territory.territories USING GIST (geo);

--- insee, postcode
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

-- COPY FROM territory
WITH oldterritory(company_id, created_at, updated_at, deleted_at, level, name, active, active_since, contacts, old_territory_id) AS (
  SELECT 
    cc._id as company_id,
    tt.created_at as created_at,
    tt.updated_at as updated_at,
    tt.deleted_at as deleted_at,
    'intertown'::territory.territory_level_enum as level,
    tt.name as name,
    (CASE WHEN tt.cgu_accepted_at is NULL THEN false ELSE true END) as active,
    tt.cgu_accepted_at as active_since,
    tt.contacts as contacts,
    tt._id as old_territory_id
  FROM territory.territories_old as tt
  LEFT JOIN company.companies as cc
  ON cc.siret = tt.siret
), territory (_id, old_territory_id) as (
  -- INSERT old territories
  INSERT INTO territory.territories (
    company_id,
    created_at,
    updated_at,
    deleted_at,
    level,
    name,
    active,
    active_since,
    contacts,
    old_territory_id
  ) SELECT * from oldterritory
  RETURNING _id, old_territory_id
),
-- COPY FROM INSEE
oldinsee (name, level, density, postcodes, geo, old_insee_id) as (
  SELECT
    (CASE
        WHEN ci.town is null THEN ci.country 
        ELSE ci.town 
      END) as name,
    (CASE
      WHEN ci.code like '99%' THEN 'country'::territory.territory_level_enum
      WHEN length(ci.code) = 2 THEN 'region'::territory.territory_level_enum
      ELSE 'town'::territory.territory_level_enum
    END) as level,
    ci.density,
    ci.postcodes,
    ci.geo,
    ci.code as old_insee_id
  FROM common.insee as ci
),
-- INSERT INSEE CODE AS TERRITORY
insee (_id, old_insee_id) as (
  INSERT INTO territory.territories (
    name,
    level,
    density,
    geo,
    old_insee_id
  ) SELECT 
  name,
    level,
    density,
    geo,
    old_insee_id
   FROM oldinsee
  RETURNING _id, old_insee_id
),
-- ADD META POSTCODE FROM INSEE
postcode as (
  INSERT INTO territory.territory_codes (territory_id, type, value)
    SELECT
      tt._id as territory_id,
      'postcode' as type,
      UNNEST(inn.postcodes) as value
    FROM oldinsee as inn
    JOIN insee as tt
    ON tt.old_insee_id = inn.old_insee_id
),
-- ADD META INSEE CODE FROM INSEE
insee_code as (
  INSERT INTO territory.territory_codes(territory_id, type, value)
    SELECT
      tt._id as territory_id,
      'insee' as type,
      inn.old_insee_id as value
    FROM oldinsee as inn
    JOIN insee as tt
    ON tt.old_insee_id = inn.old_insee_id
),
-- COPY RELATION BETWEEN OLD TERRITORIES AND OLD INSEE
territory_insee as (
  SELECT
    ttp._id as parent_territory_id,
    ttc._id as child_territory_id
  FROM territory as ttp
  JOIN territory.insee as ti ON ti.territory_id = ttp.old_territory_id
  JOIN insee as ttc
  ON ttc.old_insee_id = ti._id
)
INSERT INTO territory.territory_relation (parent_territory_id, child_territory_id)
SELECT parent_territory_id, child_territory_id FROM territory_insee;

ALTER TABLE territory.territories
  DROP column old_insee_id,
  DROP column old_territory_id;
