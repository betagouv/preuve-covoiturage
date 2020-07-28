-- territory relation change triggers

CREATE OR REPLACE FUNCTION touch_territory_view_on_territory_relation_update() RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
BEGIN
  WITH relations as(
    (select * from relation_old_table) 
    UNION ALL
    (select * from relation_new_table)
  ),
  changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relations 
  )
  
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
      
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION touch_territory_view_on_territory_relation_insert() RETURNS TRIGGER AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_new_table 
  )
  SELECT NULL FROM changed_ids INTO r LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION touch_territory_view_on_territory_relation_delete() RETURNS TRIGGER AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_old_table 
  )
  SELECT NULL FROM changed_ids INTO r  LEFT JOIN  territory.update_territory_view_data(changed_ids.ids) ON TRUE;
    
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- setup relations triggers
DROP TRIGGER IF EXISTS territory_relation_ins ON territory.territory_relation CASCADE;
DROP TRIGGER IF EXISTS territory_relation_upd ON territory.territory_relation CASCADE;
DROP TRIGGER IF EXISTS territory_relation_del ON territory.territory_relation CASCADE;

CREATE TRIGGER territory_relation_ins
 AFTER INSERT ON territory.territory_relation  REFERENCING NEW TABLE AS relation_new_table
 FOR EACH STATEMENT EXECUTE PROCEDURE touch_territory_view_on_territory_relation_insert();

CREATE TRIGGER territory_relation_upd
 AFTER UPDATE ON territory.territory_relation  REFERENCING OLD TABLE AS relation_old_table NEW TABLE AS relation_new_table
 FOR EACH STATEMENT EXECUTE PROCEDURE touch_territory_view_on_territory_relation_update();

CREATE TRIGGER territory_relation_del
 AFTER DELETE ON territory.territory_relation  REFERENCING OLD TABLE AS relation_old_table
 FOR EACH STATEMENT EXECUTE PROCEDURE touch_territory_view_on_territory_relation_delete();

