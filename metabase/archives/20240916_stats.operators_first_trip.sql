 WITH l AS (
         SELECT acquisitions.operator_id,
            min(acquisitions.created_at) AS min,
            max(acquisitions.created_at) AS max,
            count(acquisitions.created_at) AS trips
           FROM acquisition.acquisitions
          GROUP BY acquisitions.operator_id
        )
 SELECT oo.name,
    l.min,
    l.max,
    l.trips
   FROM l
     LEFT JOIN operator.operators oo ON l.operator_id = oo._id
  GROUP BY oo.name, l.min, l.max, l.trips
  ORDER BY l.min;
  