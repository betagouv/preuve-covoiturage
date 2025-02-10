ALTER TABLE auth.users
  ALTER COLUMN firstname DROP NOT NULL,
  ALTER COLUMN lastname DROP NOT NULL;

ALTER TABLE territory.territories
  ADD COLUMN siret VARCHAR;