 SELECT oo.name AS operator,
    count(cc._id) AS collision_count,
    date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text)) AS month,
    fl.geo_code,
    sum(pi.result) FILTER (WHERE cc.status = 'ok'::carpool.carpool_status_enum) / 100 AS euros,
    sum(pi.result) FILTER (WHERE cc.status = 'fraudcheck_error'::carpool.carpool_status_enum) / 100 AS avoided_incetive_euros
   FROM fraudcheck.labels fl
     JOIN carpool.carpools cc ON cc._id = fl.carpool_id
     JOIN operator.operators oo ON cc.operator_id = oo._id
     LEFT JOIN policy.incentives pi ON pi.carpool_id = cc._id
  WHERE fl.label::text = 'interoperator_fraud'::text
  GROUP BY (date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text))), oo.name, fl.geo_code;
  