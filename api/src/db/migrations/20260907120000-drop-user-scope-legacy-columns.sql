-- Contract GEN-686 : auth.user_scopes est la seule source de vérité des périmètres.
ALTER TABLE auth.users
  DROP COLUMN operator_id,
  DROP COLUMN territory_id;
