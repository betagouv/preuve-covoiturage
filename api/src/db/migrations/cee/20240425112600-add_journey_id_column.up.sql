-- operator_journey_id can be NULL on long distance applications
ALTER TABLE cee.cee_applications
  ADD COLUMN operator_journey_id VARCHAR(255) NULL;
