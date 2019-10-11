CREATE TYPE payments_type_enum AS enum('incentive', 'payment');
CREATE TYPE payments_status_enum AS enum('draft', 'validated', 'warning', 'error');

CREATE TABLE payments
(
  _id serial primary key,

  carpool_id varchar NOT NULL,
  siret varchar NOT NULL,
  order smallint NOT NULL,

  type payments_type_enum NOT NULL,
  amount int NOT NULL DEFAULT 0,

  meta json,
  status payments_status_enum NOT NULL,
);

CREATE INDEX ON payments (carpool_id);
CREATE INDEX ON payments (siret);
CREATE INDEX ON payments (type);
CREATE INDEX ON payments (status);
