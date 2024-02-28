-- Insert country only if exists
INSERT INTO territory.territories
  (level, name, shortname)
  SELECT 'country', 'France', 'FR'
  WHERE NOT EXISTS (
    SELECT * FROM territory.territories WHERE name = 'France'
  );

-- Map regions to country
INSERT INTO territory.territory_relation
  (parent_territory_id, child_territory_id)
  SELECT
    (SELECT _id from territory.territories WHERE name = 'France') AS parent_territory_id,
    _id AS child_territory_id
    FROM territory.territories
    WHERE level = 'region'
ON CONFLICT DO NOTHING;
