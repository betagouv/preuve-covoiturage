SELECT date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text)) AS date_trunc,
    sum(pi.amount) / 100 AS sum_incentives,
    count(multi_account_oui.operator_journey_id) AS count_oji,
    multi_account_oui.phone_trunc,
    multi_account_oui.operator_user_id
   FROM stats.fraud_multi_oui_on_idfm_with_oji multi_account_oui
     JOIN carpool.carpools cc ON multi_account_oui.operator_journey_id::text = cc.operator_journey_id::text AND cc.is_driver = true
     LEFT JOIN policy.incentives pi ON pi.carpool_id = cc._id AND pi.policy_id = 459
  GROUP BY (date_trunc('month'::text, (cc.datetime AT TIME ZONE 'EUROPE/PARIS'::text))), multi_account_oui.phone_trunc, multi_account_oui.operator_user_id;
  