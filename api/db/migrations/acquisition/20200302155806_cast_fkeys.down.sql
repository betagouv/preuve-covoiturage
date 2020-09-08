-- -- alter acquisition table
-- alter table acquisition.acquisitions
--   alter column application_id type varchar using application_id::varchar,
--   alter column operator_id type varchar using operator_id::varchar;

-- -- alter errors table
-- alter table acquisition.errors
--   alter column operator_id type varchar using operator_id::varchar;

-- -- update all 'unknown' values to 0
-- update acquisition.acquisitions set application_id = 'unknown' where application_id = '0';
