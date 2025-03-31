ALTER TABLE IF EXISTS territory.territory_group ALTER COLUMN shortname DROP NOT NULL;

ALTER TABLE IF EXISTS territory.territory_group ALTER COLUMN address DROP NOT NULL;

ALTER TABLE IF EXISTS territory.territory_group ALTER COLUMN contacts DROP NOT NULL;

DROP TABLE IF EXISTS territory.territory_codes CASCADE;
DROP TABLE IF EXISTS territory.territories CASCADE;
DROP TABLE IF EXISTS territory.territory_relation CASCADE;
DROP TABLE IF EXISTS territory.territory_operators_legacy CASCADE;
DROP TABLE IF EXISTS territory.insee CASCADE;

