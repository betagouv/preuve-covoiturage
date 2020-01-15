CREATE TABLE IF NOT EXISTS certificate.certificates
(
	_id serial primary key,
	uuid uuid NOT NULL DEFAULT uuid_generate_v4 (),
	identity_id varchar NOT NULL,
	operator_id varchar NOT NULL,
	territory_id varchar NOT NULL,
	start_at timestamp with time zone NOT NULL,
	end_at timestamp with time zone NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
	meta jsonb NOT NULL DEFAULT '{}'
);

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
