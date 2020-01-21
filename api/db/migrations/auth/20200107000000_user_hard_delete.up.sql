-- DELETE FROM auth.users WHERE deleted_at is not null;
ALTER TABLE auth.users DROP COLUMN deleted_at;