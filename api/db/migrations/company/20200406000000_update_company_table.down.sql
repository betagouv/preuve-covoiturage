ALTER TABLE company.companies
  DROP CONSTRAINT companies_pkey,
  ADD PRIMARY KEY(siret),
  DROP COLUMN _id;
