ALTER TABLE carpool.identities
  ADD COLUMN identity_key VARCHAR (64);

CREATE INDEX ON carpool.identities(identity_key);
