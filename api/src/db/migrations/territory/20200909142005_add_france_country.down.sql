-- Delete regions, then country
DELETE FROM territory.territory_relation WHERE parent_territory_id = (SELECT _id FROM territory.territories WHERE name = 'France');
DELETE FROM territory.territories WHERE name = 'France';
