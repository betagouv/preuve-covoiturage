-- Rattrapage idempotent avant le DROP : reprend le backfill de 20260718100000, opérateur prioritaire.
INSERT INTO auth.user_scopes (user_id, operator_id, is_default)
SELECT u._id, u.operator_id, true FROM auth.users u
WHERE u.operator_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.user_scopes s WHERE s.user_id = u._id);

INSERT INTO auth.user_scopes (user_id, territory_id, is_default)
SELECT u._id, u.territory_id, true FROM auth.users u
WHERE u.territory_id IS NOT NULL AND u.operator_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM auth.user_scopes s WHERE s.user_id = u._id);

-- Garde bloquante : aucun périmètre legacy ne doit disparaître avec les colonnes.
DO $$
DECLARE
  orphans int;
BEGIN
  SELECT count(*) INTO orphans
  FROM auth.users u
  WHERE (
      u.operator_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM auth.user_scopes s
        WHERE s.user_id = u._id AND s.operator_id = u.operator_id
      )
    )
    OR (
      u.operator_id IS NULL AND u.territory_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM auth.user_scopes s
        WHERE s.user_id = u._id AND s.territory_id = u.territory_id
      )
    );

  IF orphans > 0 THEN
    RAISE EXCEPTION
      'Migration interrompue : % compte(s) portent un périmètre dans auth.users (operator_id/territory_id) sans ligne équivalente dans auth.user_scopes. Supprimer ces colonnes perdrait leur périmètre. Réconcilier auth.user_scopes pour ces comptes avant de rejouer la migration.',
      orphans;
  END IF;
END;
$$;

-- Contract GEN-686 : auth.user_scopes est la seule source de vérité des périmètres.
ALTER TABLE auth.users
  DROP COLUMN operator_id,
  DROP COLUMN territory_id;
