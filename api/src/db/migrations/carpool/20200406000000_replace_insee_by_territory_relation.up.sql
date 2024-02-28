ALTER TABLE carpool.carpools
  ADD COLUMN start_territory_id int,
  ADD COLUMN end_territory_id int;
  

UPDATE carpool.carpools
SET 
  start_territory_id=sub.start_territory_id,
  end_territory_id=sub.end_territory_id
  FROM (
    SELECT
      c._id,
      st._id as start_territory_id,
      en._id as end_territory_id
    FROM carpool.carpools as c
    LEFT JOIN territory.territory_codes as tcs on c.start_insee = tcs.value and tcs.type = 'insee'
    LEFT JOIN territory.territory_codes as tce on c.end_insee = tce.value and tcs.type = 'insee'
    LEFT JOIN territory.territories as st ON st._id = tcs.territory_id
    LEFT JOIN territory.territories as en ON en._id = tce.territory_id
  ) as sub
WHERE carpools._id = sub._id;
