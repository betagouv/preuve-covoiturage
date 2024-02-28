-- unset the distance property when it equals 0
UPDATE acquisition.acquisitions
SET payload = payload::jsonb #- '{passenger,distance}'
WHERE payload->'passenger'->>'distance' = '0';
