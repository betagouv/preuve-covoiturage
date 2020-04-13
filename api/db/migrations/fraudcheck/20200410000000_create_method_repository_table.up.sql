CREATE TABLE IF NOT EXISTS fraudcheck.method_repository
(
  _id varchar(128) primary key,
  ponderation float NOT NULL DEFAULT 1::float,
  active boolean NOT NULL DEFAULT true
);

CREATE INDEX ON fraudcheck.method_repository(_id);
CREATE INDEX ON fraudcheck.method_repository(active);

INSERT INTO fraudcheck.method_repository (_id) VALUES 
  ('endLatitudeCollisionCheck'),
  ('endLongitudeCollisionCheck'),
  ('highDurationCheck'),
  ('highSeatCheck'),
  ('lowDurationCheck'),
  ('startEndLatitudeCollisionCheck'),
  ('startEndLongitudeCollisionCheck'),
  ('startLatitudeCollisionCheck'),
  ('startLongitudeCollisionCheck'),
  ('theoricalDistanceAndDurationCheck')
;
