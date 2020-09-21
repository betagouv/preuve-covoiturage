-- territory relation change triggers
DROP FUNCTION IF EXISTS territory.touch_territory_view_on_territory_relation_change;
CREATE OR REPLACE FUNCTION territory.touch_territory_view_on_territory_relation_change() RETURNS TRIGGER AS $$
DECLARE r int[];
BEGIN
    -- save touched ids in r
    IF (TG_OP = 'DELETE') THEN
      WITH changed_ids as (
        select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_old_table 
      )
      SELECT ids FROM changed_ids INTO r;

    ELSIF (TG_OP = 'UPDATE') THEN
      WITH relations as(
        (select parent_territory_id, child_territory_id from relation_old_table) 
        UNION ALL
        (select parent_territory_id, child_territory_id from relation_new_table)
      ),
      changed_ids as (
        select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relations
      )
      SELECT ids FROM changed_ids INTO r;
      
    ELSIF (TG_OP = 'INSERT') THEN
      WITH changed_ids as (
          select DISTINCT array_agg(array[parent_territory_id,child_territory_id]) AS ids from relation_new_table 
      )
      SELECT ids FROM changed_ids INTO r;  
    END IF;
    RAISE INFO '% rows',r;
    -- perform update on r + related territories
    PERFORM territory.update_territory_view_data(
      territory.get_relations(r::int[])
    );
    RETURN NULL; 
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS touch_territory_view_on_territory_relation_insert ON territory.territory_relation CASCADE;
DROP TRIGGER IF EXISTS touch_territory_view_on_territory_relation_update ON territory.territory_relation CASCADE;
DROP TRIGGER IF EXISTS touch_territory_view_on_territory_relation_delete ON territory.territory_relation CASCADE;

CREATE TRIGGER touch_territory_view_on_territory_relation_insert
    AFTER INSERT ON territory.territory_relation
    REFERENCING NEW TABLE AS relation_new_table
    FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_relation_change();

CREATE TRIGGER touch_territory_view_on_territory_relation_update
    AFTER UPDATE ON territory.territory_relation
    REFERENCING NEW TABLE AS relation_new_table OLD TABLE AS relation_old_table
    FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_relation_change();

CREATE TRIGGER touch_territory_view_on_territory_relation_delete
    AFTER DELETE ON territory.territory_relation
    REFERENCING OLD TABLE AS relation_old_table
    FOR EACH STATEMENT EXECUTE PROCEDURE territory.touch_territory_view_on_territory_relation_change();
