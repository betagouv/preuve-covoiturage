CREATE TABLE IF NOT EXISTS certificate.certificates
(
	_id serial primary key,
	uuid uuid NOT NULL DEFAULT uuid_generate_v4 (),
	identity_id varchar NOT NULL, -- renamed to identity_uuid in later migration
	operator_id varchar NOT NULL, -- renamed to operator_uuid in later migration
	territory_id varchar NOT NULL, -- renamed to territory_uuid in later migration
	start_at timestamp with time zone NOT NULL,
	end_at timestamp with time zone NOT NULL,
	created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
	meta jsonb NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX ON certificate.certificates (uuid);

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE ON certificate.certificates FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
