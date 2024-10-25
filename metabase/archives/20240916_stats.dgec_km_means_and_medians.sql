 SELECT oo.name,
    "left"(tl.journey_start_datetime::text, 7) AS year_month,
    count(*) AS nb_trip,
    sum(tl.journey_distance)::real / (count(*) * 1000)::double precision AS avg_km_per_trip,
    percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY (tl.journey_distance::double precision)) / 1000::double precision AS median_km_per_trip
   FROM trip.list tl
     JOIN operator.operators oo ON tl.operator_id = oo._id
  WHERE tl.journey_start_datetime > (CURRENT_DATE - '1 year'::interval) AND tl.status = 'ok'::carpool.carpool_status_enum AND tl.journey_distance < 100000
  GROUP BY tl.operator_id, oo.name, ("left"(tl.journey_start_datetime::text, 7));