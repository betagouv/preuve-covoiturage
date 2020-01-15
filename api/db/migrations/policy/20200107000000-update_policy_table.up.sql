ALTER TABLE policy.policies
  ADD COLUMN slug varchar;

CREATE UNIQUE INDEX ON policy.policies (slug);
