CREATE TABLE IF NOT EXISTS certificate.certificates
(
	_id uuid primary key NOT NULL DEFAULT uuid_generate_v4 (),
	identity_id varchar NOT NULL,
	operator_id varchar NOT NULL,
	territory_id varchar NOT NULL,
	start_at timestamp NOT NULL,
	end_at timestamp NOT NULL,
	created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
	meta jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS certificate.access_log
(
  _id serial primary key,
  certificate_id uuid references certificate.certificates (_id),
  created_at timestamp NOT NULL DEFAULT NOW(),
  ip inet,
  user_agent varchar,
  user_id varchar,
  content_type varchar
);

CREATE INDEX on certificate.access_log (certificate_id);

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
