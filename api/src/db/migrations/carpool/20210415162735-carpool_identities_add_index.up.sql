CREATE INDEX
  IF NOT EXISTS identities_created_at_idx
  ON carpool.identities (created_at);

CREATE INDEX
  IF NOT EXISTS identities_phone_trunc_travel_pass_name_travel_pass_user_id_idx
  ON carpool.identities (phone_trunc, travel_pass_name, travel_pass_user_id);
