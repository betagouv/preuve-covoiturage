alter table auth.users
  alter column operator_id type varchar using operator_id::varchar,
  alter column territory_id type varchar using territory_id::varchar;
