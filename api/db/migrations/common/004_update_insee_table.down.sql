ALTER TABLE common.insee DROP CONSTRAINT insee_pkey;
ALTER TABLE common.insee DROP COLUMN _id;
ALTER TABLE common.insee RENAME COLUMN code TO _id;
ALTER TABLE common.insee ADD PRIMARY KEY (_id);

