ALTER TYPE carpool.carpool_status_enum 
  ADD VALUE IF NOT EXISTS 'fraudcheck_error' AFTER 'canceled';
