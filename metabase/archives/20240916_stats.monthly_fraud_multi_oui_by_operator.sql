 WITH oui_by_aom AS (
         SELECT unnest(sf.oui_agg) AS operator_user_id,
            sf.aom
           FROM stats.fraud_multi_oui sf
        ), carpools_for_journeys AS (
         SELECT oui_by_aom.aom,
            oui_by_aom.operator_user_id,
            cc.operator_journey_id,
            cc.operator_id,
            cc.datetime,
            pi.amount
           FROM oui_by_aom
             JOIN carpool.identities ci ON oui_by_aom.operator_user_id::text = ci.operator_user_id::text
             JOIN carpool.carpools cc ON cc.identity_id = ci._id
             LEFT JOIN policy.incentives pi ON pi.carpool_id = cc._id AND pi.policy_id <> 766
        )
 SELECT carpools_for_journeys.aom,
    date_trunc('month'::text, (carpools_for_journeys.datetime AT TIME ZONE 'EUROPE/PARIS'::text)) AS date_trunc,
    count(DISTINCT carpools_for_journeys.operator_journey_id) AS journey_id_count,
    sum(carpools_for_journeys.amount) / 100 AS incentives,
    carpools_for_journeys.operator_id
   FROM carpools_for_journeys
  GROUP BY (date_trunc('month'::text, (carpools_for_journeys.datetime AT TIME ZONE 'EUROPE/PARIS'::text))), carpools_for_journeys.operator_id, carpools_for_journeys.aom
  ORDER BY (date_trunc('month'::text, (carpools_for_journeys.datetime AT TIME ZONE 'EUROPE/PARIS'::text)));