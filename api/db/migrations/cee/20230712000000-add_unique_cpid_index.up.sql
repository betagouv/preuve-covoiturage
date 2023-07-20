CREATE UNIQUE INDEX IF NOT EXISTS cee_carpool_id_on_short_application ON cee.cee_applications(carpool_id) WHERE (is_specific = false AND journey_type = 'short');
