 SELECT DISTINCT date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) AS heure,
    count(*) / 978 AS trajets
   FROM trip.list
  WHERE list.journey_start_datetime >= '2020-01-01 00:00:00+00'::timestamp with time zone
  GROUP BY (date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)));