 WITH journeys AS (
         SELECT list.journey_id,
            list.journey_start_insee AS insee,
            'origin'::text AS one_way,
            date_part('hour'::text, list.journey_start_datetime) AS hour
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_start_datetime < now()
        UNION ALL
         SELECT list.journey_id,
            list.journey_end_insee AS insee,
            'destination'::text AS one_way,
            date_part('hour'::text, list.journey_start_datetime) AS hour
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_start_datetime < now()
        ), night_journeys AS (
         SELECT journeys.insee,
            count(journeys.journey_id) AS night_sum
           FROM journeys
          WHERE journeys.hour = ANY (ARRAY[22::double precision, 23::double precision, 0::double precision, 1::double precision, 2::double precision, 3::double precision, 4::double precision, 5::double precision])
          GROUP BY journeys.insee
        ), day_journeys AS (
         SELECT journeys.insee,
            count(journeys.journey_id) AS day_sum
           FROM journeys
          WHERE journeys.hour <> ALL (ARRAY[22::double precision, 23::double precision, 0::double precision, 1::double precision, 2::double precision, 3::double precision, 4::double precision, 5::double precision])
          GROUP BY journeys.insee
        )
 SELECT
        CASE
            WHEN a.insee IS NULL THEN b.insee
            ELSE a.insee
        END AS insee,
    COALESCE(a.night_sum, 0::bigint) AS night_sum,
    COALESCE(b.day_sum, 0::bigint) AS day_sum,
    a.night_sum::numeric / (a.night_sum + b.day_sum)::numeric * 100::numeric AS rate
   FROM night_journeys a
     FULL JOIN day_journeys b ON a.insee::text = b.insee::text
  WHERE (a.night_sum::numeric / (a.night_sum + b.day_sum)::numeric * 100::numeric) > 50::numeric AND (a.night_sum + b.day_sum) > 100
  ORDER BY (a.night_sum::numeric / (a.night_sum + b.day_sum)::numeric * 100::numeric) DESC;
