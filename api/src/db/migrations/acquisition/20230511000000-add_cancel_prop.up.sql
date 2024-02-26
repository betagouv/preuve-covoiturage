ALTER TABLE acquisition.acquisitions 
  ADD COLUMN IF NOT EXISTS cancel_code VARCHAR(32),
  ADD COLUMN IF NOT EXISTS cancel_message VARCHAR(512);
