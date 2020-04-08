ALTER TABLE company.companies
  DROP CONSTRAINT companies_pkey,
  ADD COLUMN _id SERIAL PRIMARY KEY;

CREATE UNIQUE INDEX ON company.companies(siret);
