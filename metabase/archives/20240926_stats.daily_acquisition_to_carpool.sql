SELECT date_trunc('day'::text, (aa.created_at AT TIME ZONE 'Europe/Paris'::text)) AS day,
  count(aa.*) AS acquisitions,
  count(cc.*) AS carpools
  FROM acquisition.acquisitions aa
  LEFT JOIN carpool_v2.carpools cc ON aa.operator_id = cc.operator_id AND (aa.payload ->> 'operator_journey_id'::text) = cc.operator_journey_id::text
WHERE aa.created_at > (CURRENT_TIMESTAMP - '1 mon'::interval) AND aa.status <> 'error'::acquisition.acquisition_status_enum
GROUP BY (date_trunc('day'::text, (aa.created_at AT TIME ZONE 'Europe/Paris'::text)))
ORDER BY (date_trunc('day'::text, (aa.created_at AT TIME ZONE 'Europe/Paris'::text))) DESC;
