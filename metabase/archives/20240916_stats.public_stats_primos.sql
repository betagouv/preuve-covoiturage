 WITH primos AS (
         SELECT count(DISTINCT ROW(ci.phone_trunc, ci.operator_user_id)) FILTER (WHERE cc.is_driver = true) AS primo_drivers_optrunc,
            count(DISTINCT ROW(ci.phone_trunc, ci.operator_user_id)) FILTER (WHERE cc.is_driver = false) AS primo_passengers_optrunc,
            count(DISTINCT ci.phone) FILTER (WHERE cc.is_driver = true) AS primo_drivers_phone,
            count(DISTINCT ci.phone) FILTER (WHERE cc.is_driver = false) AS primo_passengers_phone
           FROM carpool.identities ci
             LEFT JOIN carpool.carpools cc ON cc.identity_id = ci._id
        )
 SELECT primos.primo_drivers_optrunc + primos.primo_drivers_phone AS primo_drivers,
    primos.primo_passengers_optrunc + primos.primo_passengers_phone AS primo_passengers
   FROM primos;