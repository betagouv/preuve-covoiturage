-- =============================================================================
-- 0005_search_extensions — unaccent + pg_trgm pour la recherche de territoires
-- =============================================================================
--
-- Socle de la recherche de territoires insensible aux accents et tolérante aux
-- fautes de frappe (destinée à remplacer l'index Meilisearch `geo`). La table de
-- recherche elle-même sera un modèle dbt de zone_exposed avec un index GIN
-- trigram sur un libellé désaccentué.
--
--   unaccent : normalise les diacritiques ("Rhône" -> "Rhone").
--   pg_trgm  : similarité par trigrammes (opérateur %, similarity()), index GIN.
--
-- Deux modules contrib « trusted » du cœur PostgreSQL : un rôle avec CREATE sur
-- la base les installe sans superuser — c'est le cas du rôle `datalake`.
-- Supportés par Scaleway Managed Database (l'instance fait déjà tourner postgis,
-- h3/h3_postgis et uuid-ossp, plus lourds à autoriser que ces deux-là).
--
-- Quirk : unaccent() est marquée STABLE (elle dépend d'un dictionnaire de
-- recherche), donc interdite dans une expression d'index — « functions in index
-- expression must be marked IMMUTABLE ». Le wrapper ci-dessous fige le
-- dictionnaire (forme à deux arguments) et se déclare IMMUTABLE : c'est le
-- contournement standard, à utiliser partout où le libellé désaccentué est
-- indexé ou comparé.
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$;
