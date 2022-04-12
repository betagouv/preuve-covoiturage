CREATE TABLE territory.territory_group AS
WITH territory_group_id AS
	(SELECT DISTINCT au.territory_id
		FROM auth.users AS au
		WHERE au.territory_id IS NOT NULL)
SELECT
  tt._id,
	tt.company_id,
	tt.created_at,
	tt.updated_at,
	tt.deleted_at,
	tt.name,
	tt.shortname,
	tt.contacts,
	tt.address
FROM territory.territories AS tt
JOIN territory_group_id AS tgid ON tt._id = tgid.territory_id;

CREATE TABLE territory.territory_group_selector AS
SELECT
  tg._id AS territory_group_id,
  "_id" AS selector_type
  tgr::varchar AS selector_value
FROM territory.territory_group AS tg
JOIN UNNEST(territory.get_descendants(ARRAY[tg._id])) AS tgr ON true;

