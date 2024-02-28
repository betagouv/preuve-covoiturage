CREATE TABLE territory.territory_group AS
WITH territory_group_id AS
	(SELECT DISTINCT au.territory_id
		FROM auth.users AS au
		WHERE au.territory_id IS NOT NULL)
SELECT
  tt._id,
	tt.company_id,
	COALESCE(tt.created_at, NOW()) as created_at,
	COALESCE(tt.updated_at, NOW()) as updated_at,
  tt.deleted_at as deleted_at,
	tt.name,
	COALESCE(tt.shortname, '') as shortname,
	COALESCE(tt.contacts, '{}'::json) as contacts,
	COALESCE(tt.address, '{}'::json) as address
FROM territory.territories AS tt
JOIN territory_group_id AS tgid ON tt._id = tgid.territory_id;

CREATE SEQUENCE territory.territory_group__id_seq;
SELECT setval('territory.territory_group__id_seq', (SELECT coalesce(max(_id),1) FROM territory.territory_group));

ALTER TABLE territory.territory_group
  ALTER COLUMN _id SET DEFAULT nextval('territory.territory_group__id_seq'::regclass),
  ALTER COLUMN company_id SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN shortname SET DEFAULT '',
  ALTER COLUMN shortname SET NOT NULL,
  ALTER COLUMN contacts SET DEFAULT '{}'::json,
  ALTER COLUMN contacts SET NOT NULL,
  ALTER COLUMN address SET DEFAULT '{}'::json,
  ALTER COLUMN address SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ADD CONSTRAINT territory_group_pkey PRIMARY KEY (_id),
  ADD CONSTRAINT territory_group_company_fk FOREIGN KEY (company_id) REFERENCES company.companies (_id);
CREATE INDEX territory_group_deleted_idx ON territory.territory_group (deleted_at);
CREATE INDEX territory_group_name_idx ON territory.territory_group (name);

CREATE TRIGGER touch_territory_group_updated_at BEFORE UPDATE
  ON territory.territory_group FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE territory.territory_group_selector AS
SELECT
  tg._id AS territory_group_id,
  '_id'::varchar AS selector_type,
  tgr::varchar AS selector_value
FROM territory.territory_group AS tg
JOIN UNNEST(territory.get_descendants(ARRAY[tg._id])) AS tgr ON true;

ALTER TABLE territory.territory_group_selector
  ALTER COLUMN territory_group_id SET NOT NULL,
  ALTER COLUMN selector_type SET NOT NULL,
  ALTER COLUMN selector_value SET NOT NULL,
  ADD CONSTRAINT territory_group_selector_territory_fk FOREIGN KEY (territory_group_id) REFERENCES territory.territory_group (_id);

CREATE INDEX territory_group_selector_group_idx ON territory.territory_group_selector (territory_group_id);
CREATE UNIQUE INDEX territory_group_selector_idx ON territory.territory_group_selector (territory_group_id, selector_type, selector_value);
