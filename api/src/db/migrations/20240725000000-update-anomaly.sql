CREATE TYPE carpool_v2.carpool_anomaly_status_enum AS ENUM (
    'pending',
    'passed',
    'failed'
);

ALTER TABLE carpool_v2.status
ADD anomaly_status carpool_v2.carpool_anomaly_status_enum DEFAULT 'pending'::carpool_v2.carpool_anomaly_status_enum NOT NULL;

CREATE INDEX carpool_status_anomaly_idx ON carpool_v2.status USING btree (anomaly_status);

ALTER TABLE anomaly.labels 
ADD operator_journey_id varchar; -- Not Null afterward