  WITH driver_trip_count_by_month AS (
    SELECT
      left((cc.start_datetime at time zone 'Europe/Paris')::text, 7) AS year_month,
      cc.driver_identity_key,
      count(*) AS trip_count,
      cc.operator_id
    FROM carpool_v2.carpools cc
    LEFT JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
    WHERE cc.start_datetime > (CURRENT_DATE - '1 year'::interval)
      AND cc.driver_identity_key IS NOT NULL
      AND cc.distance < 100000
      AND cs.acquisition_status = 'processed'
      AND cs.fraud_status = 'passed'
      AND cs.anomaly_status = 'passed'
    GROUP BY 2,1,4
    ORDER BY (count(*)) DESC
  )
  SELECT
    oo.name,
    dtcbm.year_month,
    avg(dtcbm.trip_count) AS trip_count_per_driver,
    percentile_cont(0.5::double precision) WITHIN GROUP (ORDER BY (dtcbm.trip_count::double precision)) AS median_trip_count_per_driver
  FROM driver_trip_count_by_month dtcbm
  JOIN operator.operators oo ON oo._id = dtcbm.operator_id
  GROUP BY dtcbm.operator_id, oo.name, dtcbm.year_month;
  