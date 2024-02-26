CREATE TABLE IF NOT EXISTS company.companies
(
  siret varchar(14) primary key,
  siren varchar(9) NOT NULL,
  nic varchar(5) NOT NULL,

  legal_name varchar(256) NOT NULL,

  company_naf_code varchar(5) NOT NULL,
  establishment_naf_code varchar(5) NOT NULL,
  
  legal_nature_code varchar(10),
  legal_nature_label varchar(256),

  nonprofit_code varchar(10),
  intra_vat varchar (16),

  geo geography,
  address varchar,
  headquarter boolean NOT NULL,

  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX ON company.companies (siren);