 WITH data AS (
    SELECT list.journey_distance / 1000 AS distance,
      count(*) AS trips
    FROM trip.list
    WHERE list.journey_start_datetime >= '2022-01-01 00:00:00+00'::timestamp with time zone
      AND list.journey_distance < 100000
      AND (
        (list.journey_start_department::text = ANY(ARRAY[
          '75'::character varying::text,
          '77'::character varying::text,
          '78'::character varying::text,
          '91'::character varying::text,
          '92'::character varying::text,
          '93'::character varying::text,
          '94'::character varying::text,
          '95'::character varying::text
        ])) OR (list.journey_end_department::text = ANY(ARRAY[
          '75'::character varying::text,
          '77'::character varying::text,
          '78'::character varying::text,
          '91'::character varying::text,
          '92'::character varying::text,
          '93'::character varying::text,
          '94'::character varying::text,
          '95'::character varying::text
        ]))
      )
    GROUP BY (list.journey_distance / 1000)
  )
  SELECT
    data.distance,
    data.trips,
    trunc((data.trips::real / sum(data.trips) OVER ()::double precision)::numeric * 100::numeric, 3) AS percentage
  FROM data;
