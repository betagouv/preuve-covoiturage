 WITH buckets AS (
         SELECT width_bucket(cc.distance, ARRAY[0, 3000, 5000, 10000, 15000, 20000, 50000, 80000, 1000000]) AS id
           FROM carpool_v2.carpools cc
        ), calc AS (
         SELECT buckets.id,
            count(*) AS cnt,
            sum(count(*)) OVER () AS total
           FROM buckets
          GROUP BY buckets.id
        )
 SELECT calc.id,
    calc.cnt,
    sum(calc.cnt) OVER (ORDER BY calc.id) AS cnt_cumul,
    calc.cnt::double precision / calc.total::double precision AS pct,
    sum(calc.cnt::double precision / calc.total::double precision) OVER (ORDER BY calc.id) AS pct_cumul
   FROM calc;
   