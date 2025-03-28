ALTER TABLE territory.territory_group ALTER COLUMN shortname DROP NOT NULL;

ALTER TABLE territory.territory_group ALTER COLUMN address DROP NOT NULL;

ALTER TABLE territory.territory_group ALTER COLUMN contacts DROP NOT NULL;

DROP TABLE territory.territory_codes CASCADE;
DROP TABLE territory.territories CASCADE;
DROP TABLE territory.territory_relation CASCADE;
DROP TABLE territory.territory_operators_legacy CASCADE;
DROP TABLE territory.insee CASCADE;

