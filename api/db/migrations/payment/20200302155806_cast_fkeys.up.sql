alter table payment.payments
  alter column carpool_id type integer using carpool_id::integer;
