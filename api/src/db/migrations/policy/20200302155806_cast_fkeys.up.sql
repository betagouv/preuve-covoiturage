alter table policy.policies
  alter column territory_id type integer using territory_id::integer;

alter table policy.incentives
  alter column policy_id type integer using policy_id::integer,
  alter column carpool_id type integer using carpool_id::integer;
