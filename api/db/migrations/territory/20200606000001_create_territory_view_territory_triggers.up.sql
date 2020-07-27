
-- Territory Change triggers

CREATE OR REPLACE FUNCTION touch_territory_view_on_territory_change() RETURNS TRIGGER AS $emp_audit$
BEGIN
   
    IF (TG_OP = 'DELETE') THEN
        DELETE FROM territory.territories_view where _id = OLD._id;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE territory.territories_view SET active = NEW.active,activable = NEW.activable ,level = NEW.level WHERE _id = NEW._id;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO territory.territories_view(_id,active,activable,level) VALUES(NEW._id,NEW.active,NEW.activable,NEW.level);
        RETURN NEW;
    END IF;
    RETURN NULL; 
END;
$emp_audit$ language plpgsql;
        
DROP TRIGGER IF EXISTS touch_territory_view_on_territory_change ON territory.territories CASCADE;
    
CREATE TRIGGER touch_territory_view_on_territory_change
    AFTER INSERT OR UPDATE OR DELETE ON territory.territories
    FOR EACH ROW EXECUTE PROCEDURE touch_territory_view_on_territory_change();


