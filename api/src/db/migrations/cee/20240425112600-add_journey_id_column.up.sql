-- operator_journey_id can be NULL on long distance applications
ALTER TABLE cee.cee_applications
  ADD COLUMN operator_journey_id VARCHAR(255) NULL;

-- replace the uniqueness of the carpool_id on short distance applications
CREATE UNIQUE INDEX IF NOT EXISTS cee_operator_id_operator_journey_id_on_short
  ON cee.cee_applications (operator_id, operator_journey_id)
  WHERE is_specific = false AND journey_type = 'short';
