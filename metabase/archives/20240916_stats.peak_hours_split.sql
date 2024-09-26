 SELECT DISTINCT date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)) AS heure,
    count(*) FILTER (WHERE '2020'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) AS y2020,
    count(*) FILTER (WHERE '2020'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) / 366 AS y2020_avg,
    count(*) FILTER (WHERE '2021'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) AS y2021,
    count(*) FILTER (WHERE '2021'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) / 365 AS y2021_avg,
    count(*) FILTER (WHERE '2022'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) AS y2022,
    count(*) FILTER (WHERE '2022'::double precision = date_part('year'::text, timezone('Europe/Paris'::text, list.journey_start_datetime))) / date_part('day'::text, now() - '2022-01-01 00:00:00'::timestamp without time zone::timestamp with time zone)::integer AS y2022_avg
   FROM trip.list
  WHERE list.journey_start_datetime >= '2020-01-01 00:00:00+00'::timestamp with time zone
  GROUP BY (date_part('hour'::text, timezone('Europe/Paris'::text, list.journey_start_datetime)));