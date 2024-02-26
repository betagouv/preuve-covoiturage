alter table payment.payments
  alter column carpool_id type varchar using carpool_id::varchar;
