alter table certificate.certificates
  rename identity_id to identity_uuid;

alter table certificate.certificates
  rename operator_id to operator_uuid;

alter table certificate.certificates
  rename territory_id to territory_uuid;
