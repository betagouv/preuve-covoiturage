CREATE MATERIALIZED VIEW trip.list AS (
  SELECT
    cp.trip_id as trip_id,
    cp.start_insee as start_insee,
    cp.end_insee as end_insee,
    cp.operator_id::int as operator_id,
    cp.operator_class as operator_class,

    cp.datetime as datetime,
    extract(isodow from cp.datetime) as weekday,
    extract(hour from cp.datetime) as dayhour,

    cis.town as start_town,
    tis.territory_id::int as start_territory_id,
    cie.town as end_town,
    tie.territory_id::int as end_territory_id,
    (CASE WHEN cp.distance <> null THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    cp.seats as seats,
    cp.is_driver as is_driver
  FROM carpool.carpools as cp
  JOIN common.insee as cis ON cp.start_insee = cis._id
  JOIN common.insee as cie ON cp.end_insee = cie._id
  JOIN territory.insee as tis ON cp.start_insee = tis._id
  JOIN territory.insee as tie ON cp.end_insee = tie._id
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
