 WITH applicants AS (
    SELECT ci_1.uuid
    FROM cee.cee_applications cee
    JOIN carpool.carpools cc_1 ON cee.carpool_id = cc_1._id
    JOIN carpool.identities ci_1 ON cc_1.identity_id = ci_1._id
    WHERE cee.journey_type = 'short'::cee.journey_type_enum
      AND cee.is_specific = false
      AND cee.datetime >= '2023-01-01 00:00:00'::timestamp without time zone
      AND cc_1.is_driver = true
    GROUP BY ci_1.uuid
  )
  SELECT DISTINCT cc.trip_id,
    ci.uuid,
    cc.is_driver,
    cc.datetime
  FROM carpool.carpools cc
  JOIN carpool.identities ci ON ci._id = cc.identity_id
  WHERE (ci.uuid IN ( SELECT applicants.uuid
    FROM applicants)) AND cc.datetime >= '2022-12-31 23:00:00+00'::timestamp with time zone;