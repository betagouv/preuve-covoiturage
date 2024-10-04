 SELECT "left"(timezone('Europe/Paris'::text, list.journey_start_datetime)::text, 10) AS day,
    count(*) FILTER (WHERE date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) >= 7::double precision AND date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) <= 9::double precision) AS morning,
    count(*) FILTER (WHERE date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) >= 17::double precision AND date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) <= 19::double precision) AS evening,
    count(*) AS all_day
   FROM trip.list
  WHERE list.journey_start_datetime >= '2020-01-01 00:00:00+00'::timestamp with time zone
  GROUP BY ("left"(timezone('Europe/Paris'::text, list.journey_start_datetime)::text, 10));
