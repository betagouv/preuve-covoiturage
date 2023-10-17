CREATE SCHEMA IF NOT EXISTS carpool_v2;

CREATE TABLE IF NOT EXISTS carpool_v2.carpools
(
  _id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  operator_id INTEGER NOT NULL REFERENCES operator.operators(_id),
  operator_journey_id VARCHAR NOT NULL,
  operator_trip_id VARCHAR,
  operator_class CHAR NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  start_position GEOGRAPHY NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_position GEOGRAPHY NOT NULL,
  distance INT NOT NULL,
  licence_plate VARCHAR(32),

  driver_identity_key VARCHAR(64),
  driver_operator_user_id VARCHAR(64),
  driver_phone VARCHAR(32),
  driver_phone_trunc VARCHAR(32),
  driver_travelpass_name VARCHAR(32),
  driver_travelpass_user_id VARCHAR(128),
  driver_revenue INTEGER NOT NULL,

  passenger_identity_key VARCHAR(64),
  passenger_operator_user_id VARCHAR(64),
  passenger_phone VARCHAR(32),
  passenger_phone_trunc VARCHAR(32),
  passenger_travelpass_name VARCHAR(32),
  passenger_travelpass_user_id VARCHAR(128),
  passenger_over_18 BOOLEAN,
  passenger_seats SMALLINT NOT NULL,
  passenger_contribution INTEGER NOT NULL,
  passenger_payments JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS carpool_operator_operator_journey_id_idx ON carpool_v2.carpools (operator_id, operator_journey_id);
CREATE INDEX IF NOT EXISTS carpool_operator_journey_id_idx ON carpool_v2.carpools (operator_journey_id);
CREATE INDEX IF NOT EXISTS carpool_operator_id_idx ON carpool_v2.carpools (operator_id);
CREATE INDEX IF NOT EXISTS carpool_created_at_idx ON carpool_v2.carpools (created_at);
CREATE INDEX IF NOT EXISTS carpool_start_datetime_idx ON carpool_v2.carpools (start_datetime);

CREATE INDEX IF NOT EXISTS carpool_driver_identity_key_idx ON carpool_v2.carpools (driver_identity_key);
CREATE INDEX IF NOT EXISTS carpool_driver_operator_user_id_idx ON carpool_v2.carpools (driver_operator_user_id);
CREATE INDEX IF NOT EXISTS carpool_driver_phone_trunc_idx ON carpool_v2.carpools (driver_phone_trunc);

CREATE INDEX IF NOT EXISTS carpool_passenger_identity_key_idx ON carpool_v2.carpools (passenger_identity_key);
CREATE INDEX IF NOT EXISTS carpool_passenger_operator_user_id_idx ON carpool_v2.carpools (passenger_operator_user_id);
CREATE INDEX IF NOT EXISTS carpool_passenger_phone_trunc_idx ON carpool_v2.carpools (passenger_phone_trunc);

CREATE TRIGGER touch_carpool_updated_at BEFORE UPDATE ON carpool_v2.carpools FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE IF NOT EXISTS carpool_v2.requests
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  operator_id INTEGER NOT NULL REFERENCES operator.operators(_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  operator_journey_id VARCHAR NOT NULL,
  payload JSONB,
  api_version SMALLINT NOT NULL,
  cancel_code VARCHAR(32),
  cancel_message VARCHAR(512)
);
CREATE INDEX IF NOT EXISTS carpool_requests_carpool_id_idx ON carpool_v2.requests (carpool_id);

CREATE TYPE carpool_v2.carpool_acquisition_status_enum AS enum('received', 'updated', 'processed', 'failed', 'canceled', 'expired');
CREATE TABLE IF NOT EXISTS carpool_v2.acquisition_events
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  request_id INTEGER REFERENCES carpool_v2.requests(_id),
  status carpool_v2.carpool_acquisition_status_enum NOT NULL
);
CREATE INDEX IF NOT EXISTS carpool_acquisition_events_carpool_id_idx ON carpool_v2.acquisition_events (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_acquisition_events_created_at_idx ON carpool_v2.acquisition_events (created_at);

CREATE TYPE carpool_v2.carpool_incentive_status_enum AS enum('pending', 'applied', 'finalized', 'failed');
CREATE TABLE IF NOT EXISTS carpool_v2.incentive_events
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  incentive_id INTEGER REFERENCES policy.incentives(_id),
  status carpool_v2.carpool_incentive_status_enum NOT NULL
);
CREATE INDEX IF NOT EXISTS carpool_incentive_events_carpool_id_idx ON carpool_v2.incentive_events (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_incentive_events_created_at_idx ON carpool_v2.incentive_events (created_at);

CREATE TYPE carpool_v2.carpool_fraud_status_enum AS enum('pending', 'passed', 'failed');
CREATE TABLE IF NOT EXISTS carpool_v2.fraud_events
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fraud_id INTEGER,
  status carpool_v2.carpool_fraud_status_enum NOT NULL
);
CREATE INDEX IF NOT EXISTS carpool_fraud_events_carpool_id_idx ON carpool_v2.fraud_events (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_fraud_events_created_at_idx ON carpool_v2.fraud_events (created_at);

CREATE TABLE IF NOT EXISTS carpool_v2.status
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  acquisition_last_event_id INTEGER REFERENCES carpool_v2.acquisition_events(_id),
  acquisition_status carpool_v2.carpool_acquisition_status_enum NOT NULL,
  incentive_last_event_id INTEGER REFERENCES carpool_v2.incentive_events(_id),
  incentive_status carpool_v2.carpool_incentive_status_enum NOT NULL,
  fraud_last_event_id INTEGER REFERENCES carpool_v2.fraud_events(_id),
  fraud_status carpool_v2.carpool_fraud_status_enum NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS carpool_status_carpool_id_idx ON carpool_v2.status (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_status_acquisition_idx ON carpool_v2.status (acquisition_status);
CREATE INDEX IF NOT EXISTS carpool_status_incentive_idx ON carpool_v2.status (incentive_status);
CREATE INDEX IF NOT EXISTS carpool_status_fraud_idx ON carpool_v2.status (fraud_status);
CREATE TRIGGER touch_status_updated_at BEFORE UPDATE ON carpool_v2.status FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE IF NOT EXISTS carpool_v2.geo
(
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  start_geo_code VARCHAR(5),
  end_geo_code VARCHAR(5),
  errors JSONB
);
CREATE UNIQUE INDEX IF NOT EXISTS carpool_geo_carpool_id_idx ON carpool_v2.geo(carpool_id);
CREATE INDEX IF NOT EXISTS carpool_geo_start_geo_code ON carpool_v2.geo(start_geo_code);
CREATE INDEX IF NOT EXISTS carpool_geo_end_geo_code ON carpool_v2.geo(end_geo_code);
CREATE TRIGGER touch_geo_updated_at BEFORE UPDATE ON carpool_v2.geo FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE carpool_v2.operator_incentives (
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  idx SMALLINT NOT NULL,
  siret VARCHAR(14) NOT NULL,
  amount INT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS carpool_incentives_carpool_id_idx ON carpool_v2.operator_incentives(carpool_id, idx);
CREATE INDEX IF NOT EXISTS carpool_incentives_carpool_id_idx ON carpool_v2.operator_incentives (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_incentives_siret_idx ON carpool_v2.operator_incentives (siret);

CREATE TABLE carpool_v2.operator_incentive_counterparts (
  _id SERIAL PRIMARY KEY,
  carpool_id INTEGER NOT NULL REFERENCES carpool_v2.carpools(_id),
  target_is_driver BOOLEAN NOT NULL,
  siret VARCHAR(14) NOT NULL,
  amount INT NOT NULL
);

CREATE INDEX IF NOT EXISTS carpool_incentives_carpool_id_idx ON carpool_v2.operator_incentive_counterparts (carpool_id);
CREATE INDEX IF NOT EXISTS carpool_incentives_siret_idx ON carpool_v2.operator_incentive_counterparts (siret);
