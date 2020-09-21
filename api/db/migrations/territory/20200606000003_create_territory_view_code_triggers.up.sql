-- setup code triggers 
-- We need to update all territories impacted
-- - the territory_id of updated code ;
-- - all the ancestors of theses ids ;
DROP FUNCTION IF EXISTS territory.touch_territory_view_on_territory_code_update;
CREATE OR REPLACE FUNCTION territory.touch_territory_view_on_territory_code_update() RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
BEGIN
  WITH codess as(
    (select * from codes_old_table) 
    UNION ALL
    (select * from codes_new_table)
  ),
  changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codess 
  )

  SELECT NULL FROM changed_ids INTO r LEFT JOIN territory.update_territory_view_data(
    territory.get_ancestors(changed_ids.ids::int[]) || changed_ids.ids
  ) ON TRUE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS territory.touch_territory_view_on_territory_code_insert;
CREATE OR REPLACE FUNCTION territory.touch_territory_view_on_territory_code_insert() RETURNS TRIGGER AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codes_new_table 
  )
  SELECT NULL FROM changed_ids INTO r LEFT JOIN territory.update_territory_view_data(
    territory.get_ancestors(changed_ids.ids::int[]) ||  || changed_ids.ids
  ) ON TRUE;
    
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS territory.touch_territory_view_on_territory_code_delete;
CREATE OR REPLACE FUNCTION territory.touch_territory_view_on_territory_code_delete() RETURNS TRIGGER AS $$
DECLARE r RECORD;
BEGIN
  
  WITH changed_ids as (
      select DISTINCT array_agg(territory_id) AS ids from codes_old_table 
  )
  SELECT NULL FROM changed_ids INTO r  LEFT JOIN territory.update_territory_view_data(
    territory.get_ancestors(changed_ids.ids::int[]) || changed_ids.ids
  ) ON TRUE;
    
  RETURN NEW;
END
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS territory_codes_ins ON territory.territory_codes CASCADE;
DROP TRIGGER IF EXISTS territory_codes_upd ON territory.territory_codes CASCADE;
DROP TRIGGER IF EXISTS territory_codes_del ON territory.territory_codes CASCADE;

CREATE TRIGGER territory_codes_ins
 AFTER INSERT ON territory.territory_codes  REFERENCING NEW TABLE AS codes_new_table
 FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_code_insert();

CREATE TRIGGER territory_codes_upd
 AFTER UPDATE ON territory.territory_codes  REFERENCING OLD TABLE AS codes_old_table NEW TABLE AS codes_new_table
 FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_code_update();

CREATE TRIGGER territory_codes_del
 AFTER DELETE ON territory.territory_codes  REFERENCING OLD TABLE AS codes_old_table
 FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_code_delete();