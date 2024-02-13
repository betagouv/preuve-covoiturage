CREATE SCHEMA IF NOT EXISTS export;

CREATE TABLE IF NOT EXISTS export.exports
(
  _id serial PRIMARY KEY,
  uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
  type varchar(255) NOT NULL DEFAULT 'opendata',
  status varchar(255) NOT NULL DEFAULT 'pending',
  progress integer NOT NULL DEFAULT 0,
  created_by integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW(), 
  updated_at timestamp NOT NULL DEFAULT NOW(),
  download_url_expire_at timestamp with time zone,
  download_url varchar(255),
  params json NOT NULL,
  error json,
  stats json
);

CREATE UNIQUE INDEX ON export.exports(uuid);
CREATE INDEX ON export.exports(status) WHERE status = 'pending';
CREATE TRIGGER touch_exports_updated_at
  BEFORE UPDATE ON export.exports
  FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE IF NOT EXISTS export.recipients
(
  _id serial PRIMARY KEY,
  export_id integer NOT NULL,
  scrambled_at timestamp with time zone,
  email varchar(255) NOT NULL,
  fullname varchar(255),
  message text,
  FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ON export.recipients(export_id, email);

CREATE TABLE IF NOT EXISTS export.logs
(
  _id serial PRIMARY KEY,
  export_id integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW(),
  type varchar(255) NOT NULL,
  message text NOT NULL,
  FOREIGN KEY (export_id) REFERENCES export.exports(_id) ON DELETE CASCADE
);

CREATE INDEX ON export.logs(export_id);
