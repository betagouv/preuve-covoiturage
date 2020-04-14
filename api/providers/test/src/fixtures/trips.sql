-- Joana + Bob - Atlantis

INSERT INTO acquisition.acquisitions 
  (_id, application_id, operator_id, journey_id, payload)
  VALUES (
    1,
    1,
    1,
    'test-1-aller',
    '{"operator_class":"B","journey_id":"test-1-aller","operator_journey_id":"a65f2757-f960-4abc-a1a1-fd7eca4a04be","passenger":{"distance":34039,"duration":1485,"incentives":[],"contribution":76,"seats":1,"identity":{"over_18":true,"phone":"+33612345670","name":"Joana"},"start":{"datetime":"2019-07-10T11:51:07Z","lat":47.232621,"lon":-1.526977},"end":{"datetime":"2019-07-10T12:34:14Z","lat":47.216622,"lon":-1.575375}},"driver":{"distance":34039,"duration":1485,"incentives":[],"revenue":376,"identity":{"over_18":true,"phone":"+33612345671"},"start":{"datetime":"2019-07-10T11:51:07Z","lat":47.232621,"lon":-1.526977},"end":{"datetime":"2019-07-10T12:34:14Z","lat":47.216622,"lon":-1.575375}}}'
  );

INSERT INTO acquisition.acquisitions 
  (_id, application_id, operator_id, journey_id, payload)
  VALUES (
    2,
    1,
    1,
    'test-1-retour',
    '{"operator_class":"B","journey_id":"test-1-retour","operator_journey_id":"5c8d8e62-a6f8-47d3-8c2a-a3a629a1158f","passenger":{"distance":34039,"duration":1485,"incentives":[],"contribution":76,"seats":1,"identity":{"over_18":true,"phone":"+33612345670","name":"Joana"},"end":{"datetime":"2019-07-10T18:51:07Z","lat":47.232621,"lon":-1.526977},"start":{"datetime":"2019-07-10T18:34:14Z","lat":47.216622,"lon":-1.575375}},"driver":{"distance":34039,"duration":1485,"incentives":[],"revenue":376,"identity":{"over_18":true,"phone":"+33612345671"},"end":{"datetime":"2019-07-18T11:51:07Z","lat":47.232621,"lon":-1.526977},"start":{"datetime":"2019-07-10T18:34:14Z","lat":47.216622,"lon":-1.575375}}}'
  );

--  _id                 | integer                     |           | not null | nextval('carpool.carpools__id_seq'::regclass)
--  created_at          | timestamp with time zone    |           |          | now()
--  acquisition_id      | integer                     |           |          |
--  operator_id         | integer                     |           |          |
--  trip_id             | character varying           |           |          |
--  operator_trip_id    | character varying           |           |          |
--  is_driver           | boolean                     |           |          |
--  operator_class      | character(1)                |           |          |
--  datetime            | timestamp with time zone    |           |          |
--  duration            | integer                     |           |          |
--  start_position      | geography                   |           |          |
--  start_insee         | character varying           |           |          |
--  end_position        | geography                   |           |          |
--  end_insee           | character varying           |           |          |
--  distance            | integer                     |           |          |
--  seats               | integer                     |           |          | 1
--  identity_id         | integer                     |           | not null |
--  operator_journey_id | character varying           |           |          |
--  cost                | integer                     |           | not null | 0
--  meta                | json                        |           |          |
--  status              | carpool.carpool_status_enum |           | not null | 'ok'::carpool.carpool_status_enum


INSERT INTO carpool.carpools
  (_id, acquisition_id, operator_id, trip_id, operator_trip_id, is_driver, operator_class, datetime, duration, start_position, start_insee, end_position, end_insee, distance, seats, identity_id, operator_journey_id, cost, meta, status)
  VALUES (
    1,
    1,
    1,
    'test-1-aller',
    '3a2894ec-172c-44b9-8374-e3c4fa342e1b',
    true,
    'C',
    '2019-07-10T11:51:07Z',
    1485,
    '010100000036E84B6F7F6EF8BF71AE6186C69D4740',
    '44300',
    '0101000000DBF97E6ABC34F9BF0CCC0A45BA9B4740',
    '44100',
    34039,
    1,
    2,
    'a65f2757-f960-4abc-a1a1-fd7eca4a04be',
    376,
    '{}',
    'ok'
  );

  INSERT INTO carpool.carpools
  (_id, acquisition_id, operator_id, trip_id, operator_trip_id, is_driver, operator_class, datetime, duration, start_position, start_insee, end_position, end_insee, distance, seats, identity_id, operator_journey_id, cost, meta, status)
  VALUES (
    2,
    1,
    1,
    'test-1-aller',
    '3a2894ec-172c-44b9-8374-e3c4fa342e1b',
    false,
    'C',
    '2019-07-10T11:51:07Z',
    1485,
    '010100000036E84B6F7F6EF8BF71AE6186C69D4740',
    '44300',
    '0101000000DBF97E6ABC34F9BF0CCC0A45BA9B4740',
    '44100',
    34039,
    1,
    1,
    'a65f2757-f960-4abc-a1a1-fd7eca4a04be',
    -76,
    '{}',
    'ok'
  );
