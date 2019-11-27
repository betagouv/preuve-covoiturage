CREATE MATERIALIZED VIEW trip.opendata_list AS (
  SELECT
    cpp.acquisition_id::varchar as journey_id,
    cpp.trip_id as trip_id,
    cpp.datetime as journey_start_datetime,
    trunc(ST_X(cpp.start_position::geometry)::numeric, cis.density::int) as journey_start_lat,
    trunc(ST_Y(cpp.start_position::geometry)::numeric, cis.density::int) as journey_start_lon,
    cpp.start_insee as journey_start_insee,
    cis.postcodes[0] as journey_start_postalcode,
    cis.town as journey_start_town,
    null as journey_start_EPCI, -- TODO
    cis.country as journey_start_country,
    (cpp.datetime + (cpp.duration || ' seconds')::interval) as journey_end_datetime,
    trunc(ST_X(cpp.end_position::geometry)::numeric, cie.density::int) as journey_end_lat,
    trunc(ST_Y(cpp.end_position::geometry)::numeric, cie.density::int) as journey_end_lon,
    cpp.end_insee as journey_end_insee,
    cie.postcodes[0] journey_end_postalcode,
    cie.town as journey_end_town,
    null as journey_end_EPCI,  -- TODO
    cie.country as journey_end_country,
    (CASE WHEN cpp.distance <> null THEN cpp.distance ELSE (cpp.meta::json->'calc_distance')::text::int END) as journey_distance,
    (CASE WHEN cpp.duration <> null THEN cpp.duration ELSE (cpp.meta::json->'calc_duration')::text::int END) as journey_duration,
    (CASE WHEN cid.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as driver_card,
    (CASE WHEN cip.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as passenger_card,
    cpp.operator_class as operator_class, 
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats
  FROM carpool.carpools as cpp
  JOIN common.insee AS cis ON cis._id = cpp.start_insee
  JOIN common.insee AS cie ON cie._id = cpp.end_insee
  JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true
  JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  WHERE cpp.is_driver = false
);
