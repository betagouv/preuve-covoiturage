CREATE INDEX ON carpool_v2.carpools(end_datetime);
CREATE INDEX ON carpool_v2.carpools(operator_trip_id);
ALTER TYPE carpool_v2.carpool_acquisition_status_enum ADD VALUE 'terms_violation_error';

CREATE TABLE carpool_v2.terms_violation_error_labels (
  _id SERIAL PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  carpool_id integer NOT NULL,
  labels VARCHAR[] NOT NULL
);

CREATE UNIQUE INDEX carpool_terms_violation_error_labels_carpool_id_idx ON carpool_v2.terms_violation_error_labels USING btree (carpool_id);
