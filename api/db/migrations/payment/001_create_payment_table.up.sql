CREATE TYPE payment.payment_type_enum AS enum('incentive', 'payment');
CREATE TYPE payment.payment_status_enum AS enum('draft', 'validated', 'warning', 'error');

CREATE TABLE IF NOT EXISTS payment.payments
(
  _id serial primary key,

  carpool_id varchar NOT NULL,
  siret varchar NOT NULL,
  index smallint NOT NULL,

  type payment.payment_type_enum NOT NULL,
  amount int NOT NULL DEFAULT 0,

  meta json,
  status payment.payment_status_enum NOT NULL
);

CREATE INDEX ON payment.payments (carpool_id);
CREATE INDEX ON payment.payments (siret);
CREATE INDEX ON payment.payments (type);
CREATE INDEX ON payment.payments (status);
