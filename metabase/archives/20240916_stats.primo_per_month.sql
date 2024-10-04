 WITH i AS (
         SELECT unnest(a._id) AS _id,
            a.uuid
           FROM ( SELECT uuid_generate_v4() AS uuid,
                    array_agg(identities._id) AS _id
                   FROM carpool.identities
                  WHERE identities.phone IS NOT NULL
                  GROUP BY identities.phone) a
        UNION
         SELECT unnest(b._id) AS _id,
            b.uuid
           FROM ( SELECT uuid_generate_v4() AS uuid,
                    array_agg(identities._id) AS _id
                   FROM carpool.identities
                  WHERE identities.phone_trunc IS NOT NULL AND identities.operator_user_id IS NOT NULL
                  GROUP BY identities.phone_trunc, identities.operator_user_id) b
        ), t AS (
         SELECT min(cc.datetime) AS datetime,
            i.uuid,
            cc.is_driver
           FROM carpool.carpools cc
             LEFT JOIN i ON cc.identity_id = i._id
          WHERE cc.datetime >= timezone('Europe/Paris'::text, '2020-01-01 00:00:00'::timestamp without time zone) AND cc.datetime < timezone('Europe/Paris'::text, date_trunc('month'::text, CURRENT_DATE::timestamp with time zone)) AND i._id IS NOT NULL
          GROUP BY i.uuid, cc.is_driver
        )
 SELECT "left"(timezone('Europe/Paris'::text, t.datetime)::text, 7) AS ym,
    count(*) FILTER (WHERE t.is_driver = true) AS drivers,
    count(*) FILTER (WHERE t.is_driver = false) AS passengers
   FROM t
  GROUP BY ("left"(timezone('Europe/Paris'::text, t.datetime)::text, 7))
  ORDER BY ("left"(timezone('Europe/Paris'::text, t.datetime)::text, 7));