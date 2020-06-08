DROP MATERIALIZED VIEW IF EXISTS trip.export;

CREATE MATERIALIZED VIEW trip.export AS (
  SELECT
    cpp.operator_id as operator_id,
    ope.name as operator_name,
    ts._id as start_territory_id,
    te._id as end_territory_id,
    cpp.acquisition_id::varchar as journey_id,
    cpp.trip_id as trip_id,
    cpp.datetime as journey_start_datetime,
    trunc(ST_X(cpp.start_position::geometry)::numeric, round(log(5-cis.density::int)+2)::int) as journey_start_lon,
    trunc(ST_Y(cpp.start_position::geometry)::numeric, round(log(5-cis.density::int)+2)::int) as journey_start_lat,
    cpp.start_insee as journey_start_insee,
    tcpcs.value as journey_start_postcode,
    ts.name as journey_start_town, -- TODO
    tstg.name as journey_start_epci, -- TODO
    tsc.name as journey_start_country, -- TODO
    (cpp.datetime + (cpp.duration || ' seconds')::interval) as journey_end_datetime,
    trunc(ST_X(cpp.end_position::geometry)::numeric, round(log(5-cie.density::int)+2)::int) as journey_end_lon,
    trunc(ST_Y(cpp.end_position::geometry)::numeric, round(log(5-cie.density::int)+2)::int) as journey_end_lat,
    cpp.end_insee as journey_end_insee,
    tcpce.value as journey_end_postcode, -- TODO
    te.name as journey_end_town,-- TODO
    tetg.name as journey_end_epci,  -- TODO
    tec.name as journey_end_country, -- TODO
    (CASE WHEN cpp.distance IS NOT NULL THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    (CASE WHEN cpp.duration IS NOT NULL THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    (CASE WHEN cid.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as driver_card,
    (CASE WHEN cip.travel_pass_name IS NOT NULL THEN '1' ELSE '0' END)::boolean as passenger_card,
    cpp.operator_class as operator_class, 
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats
  FROM carpool.carpools as cpp
  JOIN operator.operators as ope ON ope._id = cpp.operator_id::int


  LEFT JOIN territory.territory_codes as tcis ON tcis.type = 'insee' AND cpp.start_insee = tcis.value
  LEFT JOIN territory.territory_codes as tcie ON tcie.type = 'insee' AND cpp.end_insee = tcie.value

  LEFT JOIN territory.territory_codes as tcpcs ON tcpcs.type = 'postcode' AND tcis.territory_id = tcpcs.territory_id
  LEFT JOIN territory.territory_codes as tcpce ON tcpce.type = 'postcode' AND tcie.territory_id = tcpce.territory_id
  
  LEFT JOIN territory.territories as ts ON ts._id = tcis.territory_id AND ts.level = 'town'
  LEFT JOIN territory.territories as te ON te._id = tcie.territory_id AND te.level = 'town'
  
  LEFT JOIN territory.territories_view AS tis ON tis._id = tcis.territory_id
  LEFT JOIN territory.territories_view AS tie ON tie._id = tcie.territory_id

  LEFT JOIN territory.territories as tstg ON tstg._id = ANY (tis.ancestors) AND tstg.level = 'towngroup'
  LEFT JOIN territory.territories as tetg ON tetg._id = ANY (tie.ancestors) AND tetg.level = 'towngroup'

  LEFT JOIN territory.territories as tsc ON tsc._id = ANY (tis.ancestors) AND tsc.level = 'country'
  LEFT JOIN territory.territories as tec ON tec._id = ANY (tie.ancestors) AND tec.level = 'country'
  

  LEFT JOIN common.insee AS cis ON cis._id = cpp.start_insee
  LEFT JOIN common.insee AS cie ON cie._id = cpp.end_insee

  LEFT JOIN carpool.carpools AS cpd ON cpd.acquisition_id = cpp.acquisition_id AND cpd.is_driver = true AND cpd.status = 'ok'::carpool.carpool_status_enum
  LEFT JOIN carpool.identities AS cip ON cip._id = cpp.identity_id
  LEFT JOIN carpool.identities AS cid ON cid._id = cpd.identity_id
  WHERE cpp.is_driver = false AND cpp.status = 'ok'::carpool.carpool_status_enum
);

CREATE INDEX ON trip.export(operator_id);
CREATE INDEX ON trip.export(start_territory_id);
CREATE INDEX ON trip.export(end_territory_id);
CREATE INDEX ON trip.export(journey_start_datetime);
