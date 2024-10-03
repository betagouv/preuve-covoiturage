 WITH avg_3_month_journeys AS (
         SELECT list.journey_start_insee AS insee,
            'origin'::text AS one_way,
            count(list.journey_id) / 3 AS avg_journeys
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '4 mons'::interval) AND list.journey_start_datetime < date_trunc('day'::text, now() - '1 mon'::interval)
          GROUP BY list.journey_start_insee
        UNION ALL
         SELECT list.journey_end_insee AS insee,
            'destination'::text AS one_way,
            count(list.journey_id) / 3 AS avg_journeys
           FROM trip.list
          WHERE list.journey_end_datetime > date_trunc('day'::text, now() - '4 mons'::interval) AND list.journey_end_datetime < date_trunc('day'::text, now() - '1 mon'::interval)
          GROUP BY list.journey_end_insee
        ), last_month_journeys AS (
         SELECT list.journey_start_insee AS insee,
            'origin'::text AS one_way,
            count(list.journey_id) AS nb_journeys
           FROM trip.list
          WHERE list.journey_start_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_start_datetime < now()
          GROUP BY list.journey_start_insee
        UNION ALL
         SELECT list.journey_end_insee AS insee,
            'destination'::text AS one_way,
            count(list.journey_id) AS nb_journeys
           FROM trip.list
          WHERE list.journey_end_datetime > date_trunc('day'::text, now() - '1 mon'::interval) AND list.journey_end_datetime < now()
          GROUP BY list.journey_end_insee
        ), evolution AS (
         SELECT
                CASE
                    WHEN a.insee IS NULL THEN b.insee
                    ELSE a.insee
                END AS insee,
            sum(b.nb_journeys) AS last_month,
            sum(a.avg_journeys) AS avg_month,
            (sum(b.nb_journeys) - sum(a.avg_journeys)) / sum(a.avg_journeys) * 100::numeric AS rate
           FROM avg_3_month_journeys a
             FULL JOIN last_month_journeys b ON a.insee::text = b.insee::text
                       GROUP BY (
                CASE
                    WHEN a.insee IS NULL THEN b.insee
                    ELSE a.insee
                END)
        )
 SELECT evolution.insee,
    evolution.last_month,
    evolution.avg_month,
    evolution.rate
   FROM evolution
  WHERE evolution.last_month > 500::numeric AND evolution.rate > 100::numeric
  ORDER BY evolution.rate DESC;