 SELECT date_trunc('week'::text, (cc.datetime AT TIME ZONE 'Europe/Paris'::text)) AS week,
    cc.is_specific,
    oo.name AS operator,
    count(cc.*) AS count
   FROM cee.cee_applications cc
     JOIN operator.operators oo ON cc.operator_id = oo._id
  WHERE cc.journey_type = 'long'::cee.journey_type_enum AND date_trunc('week'::text, (cc.datetime AT TIME ZONE 'Europe/Paris'::text)) < (CURRENT_TIMESTAMP - '7 days'::interval)
  GROUP BY (date_trunc('week'::text, (cc.datetime AT TIME ZONE 'Europe/Paris'::text))), cc.is_specific, oo.name
  ORDER BY (date_trunc('week'::text, (cc.datetime AT TIME ZONE 'Europe/Paris'::text))), cc.is_specific, oo.name;
  