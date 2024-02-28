alter table policy.policies
  alter column territory_id type varchar using territory_id::varchar;

alter table policy.incentives
  alter column policy_id type varchar using policy_id::varchar,
  alter column carpool_id type varchar using carpool_id::varchar;
