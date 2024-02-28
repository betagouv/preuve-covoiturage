DROP INDEX IF EXISTS application.applications_uuid_idx;

CREATE UNIQUE INDEX ON application.applications (uuid);
