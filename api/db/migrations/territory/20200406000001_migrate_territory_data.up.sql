-- COPY FROM territory
WITH oldterritory(company_id, created_at, updated_at, deleted_at, level, name, active, active_since, contacts, old_territory_id) AS (
  SELECT 
    cc._id AS company_id,
    tt.created_at AS created_at,
    tt.updated_at AS updated_at,
    tt.deleted_at AS deleted_at,
    'epic'::territory.territory_level_enum AS level,
    tt.name AS name,
    TRUE as active,
    TRUE as activable,
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
    activable,
    active_since,
    contacts,
    old_territory_id
  ) SELECT * FROM oldterritory
  RETURNING _id, old_territory_id
),
-- COPY FROM INSEE
oldinsee (name, level,  postcodes, geo, old_insee_id) AS (
  SELECT
    (CASE
        WHEN ci.town is null THEN ci.country 
        ELSE ci.town 
      END) AS name,
    (CASE
      WHEN ci._id like '99%' THEN 'country'::territory.territory_level_enum
      -- WHEN length(ci._id) = 2 THEN 'region'::territory.territory_level_enum
      ELSE 'town'::territory.territory_level_enum
    END) AS level,
    -- ci.density,
    ci.postcodes,
    ci.geo,
    ci._id AS old_insee_id
  FROM common.insee AS ci WHERE length(ci._id) > 2 OR ci._id like '99%' -- ignore regions
),
-- INSERT INSEE CODE AS TERRITORY
insee (_id, old_insee_id) AS (
  INSERT INTO territory.territories (
    name,
    level,
    -- density,
    geo,
    old_insee_id
  ) SELECT 
  name,
    level,
    -- density,
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

DROP INDEX IF EXISTS territory.territory_operators_territory_id_operator_id_idx;

UPDATE territory.territory_operators
SET territory_id=sub.territory_id
FROM (
  SELECT
    _id as territory_id,
    old_territory_id
  FROM territory.territories
  WHERE
    old_territory_id IN (SELECT territory_id FROM territory.territory_operators)
) as sub
WHERE territory_operators.territory_id = sub.old_territory_id;


-- update region level based on its insee string length
WITH ti AS (
    SELECT t._id as ti_id, t.level FROM territory.territories AS t
    INNER JOIN territory.insee AS ti ON ti.territory_id = t.old_territory_id AND length(ti._id)::int = 2
) UPDATE territory.territories t SET level = 'region' FROM ti WHERE  ti.ti_id = t._id;

-- set region insee (not as child but as direct territory_code)
WITH insee AS (
    SELECT t._id,t.level,t.name,ti._id as insee FROM territory.territories AS t INNER JOIN territory.insee AS ti ON ti.territory_id = t.old_territory_id AND length(ti._id)::int = 2
) INSERT INTO territory.territory_codes (territory_id, type, value)  SELECT  insee._id,'insee',insee.insee FROM insee;


CREATE UNIQUE INDEX ON territory.territory_operators (territory_id, operator_id) ;
