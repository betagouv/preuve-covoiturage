 SELECT cc.operator_id,
    oo.name,
    ci.operator_user_id,
    count(DISTINCT ci.phone_trunc) AS count,
    date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text)) AS month
   FROM carpool.carpools cc
     JOIN carpool.identities ci ON cc.identity_id = ci._id
     JOIN operator.operators oo ON oo._id = cc.operator_id
  WHERE ci.created_at >= (CURRENT_DATE - '1 year'::interval)
  GROUP BY ci.operator_user_id, cc.operator_id, oo.name, (date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text)))
 HAVING count(DISTINCT ci.phone_trunc) > 1;
