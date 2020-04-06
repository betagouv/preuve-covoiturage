-- COPY FROM territory
WITH oldterritory(company_id, created_at, updated_at, deleted_at, level, name, active, active_since, contacts, old_territory_id) AS (
  SELECT 
    cc._id AS company_id,
    tt.created_at AS created_at,
    tt.updated_at AS updated_at,
    tt.deleted_at AS deleted_at,
    'towngroup'::territory.territory_level_enum AS level,
    tt.name AS name,
    (CASE WHEN tt.cgu_accepted_at is NULL THEN false ELSE true END) AS active,
    tt.cgu_accepted_at AS active_since,
    tt.contacts AS contacts,
    tt._id AS old_territory_id
  FROM territory.territories_old AS tt
  LEFT JOIN company.companies AS cc
  ON cc.siret = tt.siret
), territory (_id, old_territory_id) AS (
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
  ) SELECT * FROM oldterritory
  RETURNING _id, old_territory_id
),
-- COPY FROM INSEE
oldinsee (name, level, density, postcodes, geo, old_insee_id) AS (
  SELECT
    (CASE
        WHEN ci.town is null THEN ci.country 
        ELSE ci.town 
      END) AS name,
    (CASE
      WHEN ci._id like '99%' THEN 'country'::territory.territory_level_enum
      WHEN length(ci._id) = 2 THEN 'region'::territory.territory_level_enum
      ELSE 'town'::territory.territory_level_enum
    END) AS level,
    ci.density,
    ci.postcodes,
    ci.geo,
    ci._id AS old_insee_id
  FROM common.insee AS ci
),
-- INSERT INSEE CODE AS TERRITORY
insee (_id, old_insee_id) AS (
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
postcode AS (
  INSERT INTO territory.territory_codes (territory_id, type, value)
    SELECT
      tt._id AS territory_id,
      'postcode' AS type,
      UNNEST(inn.postcodes) AS value
    FROM oldinsee AS inn
    JOIN insee AS tt
    ON tt.old_insee_id = inn.old_insee_id
),
-- ADD META INSEE CODE FROM INSEE
insee_code AS (
  INSERT INTO territory.territory_codes(territory_id, type, value)
    SELECT
      tt._id AS territory_id,
      'insee' AS type,
      inn.old_insee_id AS value
    FROM oldinsee AS inn
    JOIN insee AS tt
    ON tt.old_insee_id = inn.old_insee_id
),
-- COPY RELATION BETWEEN OLD TERRITORIES AND OLD INSEE
territory_insee AS (
  SELECT
    ttp._id AS parent_territory_id,
    ttc._id AS child_territory_id
  FROM territory AS ttp
  JOIN territory.insee AS ti ON ti.territory_id = ttp.old_territory_id
  JOIN insee AS ttc
  ON ttc.old_insee_id = ti._id
)
INSERT INTO territory.territory_relation (parent_territory_id, child_territory_id)
SELECT parent_territory_id, child_territory_id FROM territory_insee;

-- TODO migrate territory_operator to new territory_id