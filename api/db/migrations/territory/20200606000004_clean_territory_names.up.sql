-- Apply first cap rule on name for Every AOM
WITH territory_name_init_cap AS (
select _id, INITCAP(name) as name FROM territory.territories where level='epic'
)
UPDATE territory.territories SET name = tc.name FROM territory_name_init_cap tc WHERE territories._id = tc._id;


-- Get departement code and append it to town name (for every territory with a postcode)
WITH territory_name_with_codedep AS (
select t._id, CONCAT(t.name,' (',substring(tc.value,1,2),')') as name FROM territory.territories t 
INNER JOIN territory.territory_codes tc ON (t._id = tc.territory_id AND tc."type" = 'postcode')
)
UPDATE territory.territories SET name = tc.name FROM territory_name_with_codedep tc WHERE territories._id = tc._id;