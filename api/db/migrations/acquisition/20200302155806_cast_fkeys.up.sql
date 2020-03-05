-- update all 'unknown' values to 0
update acquisition.acquisitions set application_id = '0' where application_id = 'unknown';

-- alter acquisition table
alter table acquisition.acquisitions
  alter column application_id type integer using application_id::integer,
  alter column operator_id type integer using operator_id::integer;

-- alter errors table
alter table acquisition.errors
  alter column operator_id type integer using operator_id::integer;
