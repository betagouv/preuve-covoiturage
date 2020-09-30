ALTER TABLE company.companies
  ADD COLUMN address_street varchar(255),
  ADD COLUMN address_postcode varchar(5),
  ADD COLUMN address_cedex varchar(128),
  ADD COLUMN address_city varchar(255);
