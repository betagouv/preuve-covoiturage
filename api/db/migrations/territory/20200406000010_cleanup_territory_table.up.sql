--- TODO : ERROR TO FIX !!! 
--- SELECT t._id FROM  territory.insee AS t left JOIN common.insee AS i ON i.code = t._id where i.code is null; >> 69901, 69114 << MISSING INSEE CODE !!!

--- TODO : ADD REGION/DISTRICT/TOWN RELATION


-- ALTER TABLE territory.territories
--   DROP column old_insee_id,
--   DROP column old_territory_id;

-- DROP TABLE territory.territories_old;
