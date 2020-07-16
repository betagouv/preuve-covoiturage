--- TODO : ERROR TO FIX !!! 
--- SELECT t._id FROM  territory.insee AS t left JOIN common.insee AS i ON i.code = t._id where i.code is null; >> 69901, 69114 << MISSING INSEE CODE !!!


-- check of non found insee codes
-- SELECT t.name,t.level,tci.value as insee, tcpc.value as postcode  from territory.territories as t

-- LEFT JOIN territory.territory_codes tci ON tci.type = 'insee' AND tci.territory_id = t._id
-- LEFT JOIN territory.territory_codes tcpc ON tcpc.type = 'postcode' AND tcpc.territory_id = t._id
-- LEFT JOIN common.insee ci ON ci._id = tci.value


-- WHERE tci.value IS NOT NULL AND ci._id is NULL

-- limit 10;


--- TODO : ADD REGION/DISTRICT/TOWN RELATION

ALTER TABLE territory.territories
DROP column old_insee_id,
DROP column old_territory_id;

DROP TABLE territory.territories_old;
