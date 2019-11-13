CREATE TABLE IF NOT EXISTS carpool.carpool_identities
(
  _id serial primary key,

  created_at timestamp DEFAULT NOW(), -- NOT NULL
  operator_id varchar NOT NULL,

  phone varchar(32),
  phone_trunc varchar(16),

  operator_identity_id varchar(128),
  meta json,
);
