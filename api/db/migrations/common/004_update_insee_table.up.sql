ALTER TABLE common.insee DROP CONSTRAINT insee_pkey;
ALTER TABLE common.insee RENAME COLUMN _id TO code;
ALTER TABLE common.insee ADD COLUMN _id SERIAL PRIMARY KEY;
CREATE UNIQUE INDEX ON common.insee(code);
