 WITH d AS (
         SELECT "left"(list.journey_start_datetime::text, 7) AS ym,
            sum(list.journey_distance * list.passenger_seats)::double precision AS p,
            max(list.journey_distance)::double precision AS d
           FROM trip.list
          GROUP BY list.trip_id, ("left"(list.journey_start_datetime::text, 7))
        ), tx AS (
         SELECT d.ym,
            (d.p + d.d) / d.d AS tx
           FROM d
          WHERE d.d <> 0::double precision
        )
 SELECT tx.ym,
    count(*) AS count,
    avg(tx.tx) AS avg,
    percentile_disc(0.5::double precision) WITHIN GROUP (ORDER BY tx.tx) AS median
   FROM tx
  GROUP BY tx.ym;