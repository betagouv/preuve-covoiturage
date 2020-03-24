alter table auth.users
  alter column operator_id type integer using operator_id::integer,
  alter column territory_id type integer using territory_id::integer;
