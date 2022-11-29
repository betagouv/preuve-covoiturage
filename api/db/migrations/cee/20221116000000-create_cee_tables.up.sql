CREATE SCHEMA IF NOT EXISTS cee;

CREATE TYPE cee.journey_type_enum AS enum('short', 'long');

CREATE TABLE IF NOT EXISTS cee.cee_applications (
  _id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  operator_id INT NOT NULL REFERENCES operator.operators,
  journey_type cee.journey_type_enum NOT NULL,
  is_specific BOOLEAN NOT NULL DEFAULT false,
  last_name_trunc VARCHAR(3) NOT NULL,
  phone_trunc VARCHAR(32) NOT NULL,
  datetime TIMESTAMP NOT NULL,
  carpool_id INT REFERENCES carpool.carpools,
  driving_license VARCHAR(64),
  CONSTRAINT cee_driving_license_constraint CHECK(
    CASE WHEN is_specific = true
      THEN driving_license IS NULL
      ELSE driving_license IS NOT NULL END
  ),
  CONSTRAINT cee_carpool_id_constraint CHECK(
    CASE WHEN journey_type = 'short' AND is_specific <> true
      THEN carpool_id IS NOT NULL
      ELSE carpool_id IS NULL END
  )
);

CREATE TRIGGER touch_cee_updated_at BEFORE UPDATE ON cee.cee_applications FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
CREATE INDEX IF NOT EXISTS cee_jtype_idx ON cee.cee_applications(journey_type);
CREATE INDEX IF NOT EXISTS cee_identity_idx ON cee.cee_applications(phone_trunc, last_name_trunc);
CREATE INDEX IF NOT EXISTS cee_datetime_idx ON cee.cee_applications(datetime);
CREATE INDEX IF NOT EXISTS cee_license_idx ON cee.cee_applications(driving_license);
CREATE INDEX IF NOT EXISTS cee_atype_idx ON cee.cee_applications(is_specific);
