DROP MATERIALIZED VIEW IF EXISTS trip.export;

CREATE MATERIALIZED VIEW trip.export AS (
  SELECT
    cpp.operator_id as operator_id,
    ope.name as operator_name,
    tis.territory_id as start_territory_id,
    tie.territory_id as end_territory_id,
    cpp.acquisition_id::varchar as journey_id,
    cpp.trip_id as trip_id,
    cpp.datetime as journey_start_datetime,
    trunc(ST_X(cpp.start_position::geometry)::numeric, round(log(5-cis.density::int)+2)::int) as journey_start_lon,
    trunc(ST_Y(cpp.start_position::geometry)::numeric, round(log(5-cis.density::int)+2)::int) as journey_start_lat,
    cpp.start_insee as journey_start_insee,
    cis.postcodes[1] as journey_start_postcode,
    cis.town as journey_start_town,
    null as journey_start_epci, -- TODO
    cis.country as journey_start_country,
    (cpp.datetime + (cpp.duration || ' seconds')::interval) as journey_end_datetime,
    trunc(ST_X(cpp.end_position::geometry)::numeric, round(log(5-cie.density::int)+2)::int) as journey_end_lon,
    trunc(ST_Y(cpp.end_position::geometry)::numeric, round(log(5-cie.density::int)+2)::int) as journey_end_lat,
    cpp.end_insee as journey_end_insee,
    cie.postcodes[1] as journey_end_postcode,
    cie.town as journey_end_town,
    null as journey_end_epci,  -- TODO
    cie.country as journey_end_country,
    (CASE WHEN cpp.distance IS NOT NULL THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    (CASE WHEN cpp.duration IS NOT NULL THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    (CASE WHEN cid.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as driver_card,
    (CASE WHEN cip.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as passenger_card,
    cpp.operator_class as operator_class, 
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats
  FROM carpool.carpools as cpp
  JOIN operator.operators as ope ON ope._id = cpp.operator_id::int
  JOIN territory.insee AS tis ON tis._id = cpp.start_insee
  JOIN territory.insee AS tie ON tie._id = cpp.end_insee
  JOIN common.insee AS cis ON cis._id = cpp.start_insee
  JOIN common.insee AS cie ON cie._id = cpp.end_insee
  JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true AND cpd.status = 'ok'::carpool.carpool_status_enum
  JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  WHERE cpp.is_driver = false AND cpp.status = 'ok'::carpool.carpool_status_enum
);

CREATE INDEX ON trip.export(operator_id);
CREATE INDEX ON trip.export(start_territory_id);
CREATE INDEX ON trip.export(end_territory_id);
CREATE INDEX ON trip.export(journey_start_datetime);
