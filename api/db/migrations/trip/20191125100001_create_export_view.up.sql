CREATE MATERIALIZED VIEW trip.export AS (
  SELECT
    cpp.operator_id as operator_id,
    tis.territory_id as start_territory_id,
    tie.territory_id as end_territory_id,
    cpp.acquisition_id::varchar as journey_id,
    cpp.trip_id as trip_id,
    cpp.datetime as journey_start_datetime,
    trunc(ST_X(cpp.start_position::geometry)::numeric, cis.density::int - 1) as journey_start_lat,
    trunc(ST_Y(cpp.start_position::geometry)::numeric, cis.density::int - 1) as journey_start_lon,
    cpp.start_insee as journey_start_insee,
    array_agg(cis.postcodes) as journey_start_postcodes,
    cis.town as journey_start_town,
    null as journey_start_epci, -- TODO
    cis.country as journey_start_country,
    (cpp.datetime + (cpp.duration || ' seconds')::interval) as journey_end_datetime,
    trunc(ST_X(cpp.end_position::geometry)::numeric, cie.density::int - 1) as journey_end_lat,
    trunc(ST_Y(cpp.end_position::geometry)::numeric, cie.density::int - 1) as journey_end_lon,
    cpp.end_insee as journey_end_insee,
    array_agg(cie.postcodes) journey_end_postcodes,
    cie.town as journey_end_town,
    null as journey_end_epci,  -- TODO
    cie.country as journey_end_country,
    (CASE WHEN cpp.distance <> null THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    (CASE WHEN cpp.duration <> null THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    (CASE WHEN cid.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as driver_card,
    (CASE WHEN cip.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as passenger_card,
    cpp.operator_class as operator_class, 
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats
  FROM carpool.carpools as cpp
  JOIN territory.insee AS tis ON tis._id = cpp.start_insee
  JOIN territory.insee AS tie ON tie._id = cpp.end_insee
  JOIN common.insee AS cis ON cis._id = cpp.start_insee
  JOIN common.insee AS cie ON cie._id = cpp.end_insee
  JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true
  JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  WHERE cpp.is_driver = false
);

CREATE INDEX ON trip.export(operator_id);
CREATE INDEX ON trip.export(start_territory_id);
CREATE INDEX ON trip.export(end_territory_id);
CREATE INDEX ON trip.export(journey_start_datetime);
