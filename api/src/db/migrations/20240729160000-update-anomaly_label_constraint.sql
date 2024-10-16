
ALTER TABLE anomaly.labels DROP CONSTRAINT labels_carpool_id_fkey;
ALTER TABLE anomaly.labels DROP CONSTRAINT labels_conflicting_carpool_id_fkey;
ALTER TABLE anomaly.labels ALTER COLUMN conflicting_carpool_id DROP NOT NULL;
ALTER TABLE anomaly.labels ALTER COLUMN conflicting_operator_journey_id DROP NOT NULL;