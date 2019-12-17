CREATE TABLE IF NOT EXISTS acquisition.errors
(
	_id serial primary key,
	created_at timestamp with time zone NOT NULL DEFAULT NOW(),
	operator_id varchar NOT NULL,
	source varchar NOT NULL,
	error_message varchar,
	error_code varchar,
	error_line integer,
	auth jsonb NOT NULL DEFAULT '{}',
	headers jsonb NOT NULL DEFAULT '{}',
	body jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX ON acquisition.errors (operator_id);
