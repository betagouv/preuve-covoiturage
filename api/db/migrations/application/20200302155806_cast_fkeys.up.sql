alter table application.applications
  alter column owner_id type integer using owner_id::integer;
