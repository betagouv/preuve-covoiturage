alter table application.applications
  alter column owner_id type varchar using owner_id::varchar;
