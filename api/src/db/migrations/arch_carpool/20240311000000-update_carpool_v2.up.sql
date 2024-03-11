ALTER TABLE carpool_v2.status
  DROP COLUMN acquisition_last_event_id,
  DROP COLUMN incentive_last_event_id,
  DROP COLUMN fraud_last_event_id;

ALTER TABLE carpool_v2.status
  ALTER COLUMN acquisition_status SET DEFAULT 'received'::carpool_v2.carpool_acquisition_status_enum,
  ALTER COLUMN incentive_status  SET DEFAULT 'pending'::carpool_v2.carpool_incentive_status_enum,
  ALTER COLUMN fraud_status  SET DEFAULT 'pending'::carpool_v2.carpool_fraud_status_enum;

DROP TABLE carpool_v2.acquisition_events;
DROP TABLE carpool_v2.incentive_events;
DROP TABLE carpool_v2.fraud_events;
