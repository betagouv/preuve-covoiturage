CREATE TYPE cee.application_error_enum AS enum('validation', 'date', 'non-eligible', 'conflict');

CREATE TABLE IF NOT EXISTS cee.cee_application_errors (
  _id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  operator_id INT NOT NULL REFERENCES operator.operators,
  journey_type cee.journey_type_enum NOT NULL,
  error_type cee.application_error_enum NOT NULL,
  last_name_trunc VARCHAR(3),
  phone_trunc VARCHAR(32),
  driving_license VARCHAR(64),
  datetime VARCHAR(64),
  operator_journey_id VARCHAR(256),
  application_id uuid REFERENCES cee.cee_applications
);

CREATE INDEX IF NOT EXISTS cee_error_datetime_idx ON cee.cee_application_errors(created_at);
