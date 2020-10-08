WITH migrated_territories AS (

SELECT tr.parent_territory_id as _id,  CONCAT('{"ui_selection_state":',array_to_json(ARRAY_AGG(CONCAT('{"id":',tr.child_territory_id,',"state":2,"children":[]}')::json))::varchar,'}')::json as ui_status  from territory.territories t 
INNER JOIN territory.territory_relation tr ON tr.parent_territory_id = t._id WHERE ui_status is NULL GROUP BY tr.parent_territory_id  
)

UPDATE territory.territories t  SET ui_status = mt.ui_status FROM migrated_territories mt WHERE t._id = mt._id;