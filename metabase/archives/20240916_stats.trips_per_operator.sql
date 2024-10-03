 WITH l AS (
         SELECT to_char(cc.datetime::date::timestamp with time zone, 'yyyy-mm'::text) AS date,
            cc.operator_id,
            count(*) AS trips,
            count(*) FILTER (WHERE cc.status = 'ok'::carpool.carpool_status_enum) AS ok,
            count(*) FILTER (WHERE cc.status <> 'ok'::carpool.carpool_status_enum) AS error
           FROM carpool.carpools cc
          WHERE cc.is_driver = true
          GROUP BY (to_char(cc.datetime::date::timestamp with time zone, 'yyyy-mm'::text)), cc.operator_id
          ORDER BY (to_char(cc.datetime::date::timestamp with time zone, 'yyyy-mm'::text)), cc.operator_id
        )
 SELECT l.date,
    oo.name,
    l.trips,
    l.ok,
    l.error
   FROM l
     LEFT JOIN operator.operators oo ON l.operator_id = oo._id
  ORDER BY l.date;
