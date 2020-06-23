DELETE FROM trip.stat_cache;
-- TODO : update view after carpool
-- UPDATE de trip view

DROP MATERIALIZED VIEW IF EXISTS trip.list;
CREATE MATERIALIZED VIEW trip.list AS (
SELECT
    cp.trip_id as trip_id,
    cp.start_insee as start_insee,
    cp.end_insee as end_insee,
    cp.operator_id as operator_id,
    cp.operator_class as operator_class,
    cp.datetime as datetime,
    extract(isodow from cp.datetime) as weekday,
    extract(hour from cp.datetime) as dayhour,
    cp.seats as seats,
    cp.is_driver as is_driver,
    ts.name as start_town,
    cp.start_territory_id,
    te.name as end_town,
    cp.end_territory_id,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance
  FROM carpool.carpools as cp
  -- JOIN common.insee as cis ON cp.start_insee = cis._id
  -- JOIN common.insee as cie ON cp.end_insee = cie._id
  
  -- JOIN territory.territory_codes as tcis ON tcis.type = 'insee' AND cp.start_insee = tcis.value
  -- JOIN territory.territory_codes as tcie ON tcie.type = 'insee' AND cp.end_insee = tcie.value

  LEFT JOIN territory.territories as ts ON ts._id = cp.start_territory_id AND ts.level = 'town'
  LEFT JOIN territory.territories as te ON te._id = cp.start_territory_id AND te.level = 'town'

);

CREATE INDEX ON trip.list (start_territory_id);
CREATE INDEX ON trip.list (end_territory_id);
CREATE INDEX ON trip.list (operator_id);
CREATE INDEX ON trip.list (datetime);
CREATE INDEX ON trip.list (weekday);
CREATE INDEX ON trip.list (dayhour);
CREATE INDEX ON trip.list (distance);
CREATE INDEX ON trip.list (operator_class);
CREATE INDEX ON trip.list (is_driver);