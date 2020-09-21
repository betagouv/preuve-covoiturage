
-- Territory Change triggers
DROP FUNCTION IF EXISTS territory.touch_territory_view_on_territory_change;
CREATE OR REPLACE FUNCTION territory.touch_territory_view_on_territory_change() RETURNS TRIGGER AS $emp_audit$
BEGIN
    -- If delete, update relations + perform delete on view
    IF (TG_OP = 'DELETE') THEN
        WITH up AS (
          SELECT territory.update_territory_view_data(
            territory.get_relations(ARRAY[OLD._id]::int[]) || OLD._id
          )
        )
        DELETE FROM territory.territories_view
          WHERE _id = OLD._id;
        RETURN OLD;
    -- If update, update relations and current
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM territory.update_territory_view_data(
          territory.get_relations(ARRAY[NEW._id]::int[]) || NEW._id
        );
        RETURN NEW;
    -- If insert, update current
    ELSIF (TG_OP = 'INSERT') THEN
      PERFORM territory.update_territory_view_data(ARRAY[NEW._id]::int[]);
      RETURN NEW;
    END IF;
    RETURN NULL; 
END;
$emp_audit$ language plpgsql;

DROP TRIGGER IF EXISTS touch_territory_view_on_territory_change ON territory.territories CASCADE;
CREATE TRIGGER touch_territory_view_on_territory_change
    AFTER INSERT OR UPDATE OR DELETE ON territory.territories
    FOR EACH ROW EXECUTE PROCEDURE territory.touch_territory_view_on_territory_change();
