-- ----------------------------------------------------------------------
-- drop all related views
-- ----------------------------------------------------------------------

drop materialized view if exists trip.list cascade;
drop materialized view if exists trip.export cascade;
drop materialized view if exists policy.trips cascade;
drop view if exists common.carpools cascade;
drop view if exists certificate.identities cascade;

-- ----------------------------------------------------------------------
-- alter foreign keys
-- ----------------------------------------------------------------------

alter table carpool.carpools
  alter column acquisition_id type varchar using acquisition_id::varchar,
  alter column operator_id type varchar using operator_id::varchar;

-- ----------------------------------------------------------------------
-- recreate views manually
-- ----------------------------------------------------------------------

-- policy trips

CREATE MATERIALIZED VIEW policy.trips AS (
  SELECT
    cp._id as carpool_id,
    cp.trip_id as trip_id,
    cp.start_insee as start_insee,
    cp.end_insee as end_insee,
    cp.operator_id::int as operator_id,
    cp.operator_class as operator_class,
    cp.datetime as datetime, 
    cp.seats as seats,
    cp.cost as cost,
    cp.is_driver as is_driver,
    (CASE WHEN ci.travel_pass_user_id IS NOT NULL THEN true ELSE false END) as has_travel_pass,
    (CASE WHEN ci.over_18 IS NOT NULL THEN ci.over_18 ELSE null END) as is_over_18,
    ci.uuid as identity_uuid,
    tis.territory_id as start_territory_id,
    tie.territory_id as end_territory_id,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance,
    (CASE WHEN cp.duration IS NOT NULL THEN cp.duration ELSE (cp.meta::json->>'calc_duration')::int END) as duration
  FROM carpool.carpools as cp
  JOIN territory.insee as tis ON cp.start_insee = tis._id
  JOIN territory.insee as tie ON cp.end_insee = tie._id
  JOIN carpool.identities as ci ON cp.identity_id = ci._id
);

CREATE INDEX ON policy.trips (carpool_id);
CREATE INDEX ON policy.trips (datetime);
CREATE INDEX ON policy.trips (start_territory_id);
CREATE INDEX ON policy.trips (end_territory_id);

-- trip.export

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
    (CASE WHEN cpp.distance <> null THEN cpp.distance ELSE (cpp.meta::json->>'calc_distance')::int END) as journey_distance,
    (CASE WHEN cpp.duration <> null THEN cpp.duration ELSE (cpp.meta::json->>'calc_duration')::int END) as journey_duration,
    (CASE WHEN cid.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as driver_card,
    (CASE WHEN cip.travel_pass_name <> null THEN '1' ELSE '0' END)::boolean as passenger_card,
    cpp.operator_class as operator_class, 
    cip.over_18 as passenger_over_18,
    cpp.seats as passenger_seats
  FROM carpool.carpools as cpp
  JOIN operator.operators as ope ON ope._id = cpp.operator_id::int
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

-- trip.list

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
    cis.town as start_town,
    tis.territory_id as start_territory_id,
    cie.town as end_town,
    tie.territory_id as end_territory_id,
    (CASE WHEN cp.distance IS NOT NULL THEN cp.distance ELSE (cp.meta::json->>'calc_distance')::int END) as distance
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

-- common.carpools

CREATE OR REPLACE VIEW common.carpools AS (
  SELECT * FROM carpool.carpools
);

-- certificate.identities

CREATE OR REPLACE VIEW certificate.identities AS (
  SELECT
    ci.phone AS phone,
    array_agg(cc.identity_id) AS identities
  FROM carpool.carpools AS cc
  JOIN carpool.identities AS ci
  ON cc.identity_id::int = ci._id
  GROUP BY ci.phone
);
