CREATE TABLE IF NOT EXISTS certificate.access_log
(
  _id serial primary key,
  certificate_id integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  ip inet,
  user_agent varchar,
  user_id varchar,
  content_type varchar
);

CREATE INDEX on certificate.access_log (certificate_id);
