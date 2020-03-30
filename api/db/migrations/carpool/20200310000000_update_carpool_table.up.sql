CREATE TYPE carpool.carpool_status_enum AS enum('ok', 'expired', 'canceled');

ALTER TABLE carpool.carpools
  ADD COLUMN status carpool.carpool_status_enum NOT NULL DEFAULT 'ok';
