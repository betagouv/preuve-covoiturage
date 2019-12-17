DROP INDEX IF EXISTS application.applications_uuid_idx;

CREATE INDEX ON application.applications (uuid);
