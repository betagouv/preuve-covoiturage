alter table certificate.certificates
  rename identity_uuid to identity_id;

alter table certificate.certificates
  rename operator_uuid to operator_id;

alter table certificate.certificates
  rename territory_uuid to territory_id;
