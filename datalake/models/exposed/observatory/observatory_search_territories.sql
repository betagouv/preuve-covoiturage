{{ config(
    materialized='table',
    tags=['exposed', 'observatory', 'search', 'territories'],
    post_hook=[
      "CREATE UNIQUE INDEX IF NOT EXISTS {{ this.name }}_key_idx ON {{ this }} (territory, type, year)",
      "CREATE UNIQUE INDEX IF NOT EXISTS {{ this.name }}_id_latest_idx ON {{ this }} (id) WHERE is_latest",
      "CREATE INDEX IF NOT EXISTS {{ this.name }}_id_idx ON {{ this }} (id)",
      "CREATE INDEX IF NOT EXISTS {{ this.name }}_label_trgm_idx ON {{ this }} USING gin (public.immutable_unaccent(lower(l_territory)) public.gin_trgm_ops)",
      "CREATE INDEX IF NOT EXISTS {{ this.name }}_type_latest_idx ON {{ this }} (type, is_latest)",
    ]
) }}

-- Référentiel plat « un territoire recherchable par ligne » pour l'autocomplete de
-- sélection de territoire de l'observatoire (remplace l'index Meilisearch `geo`).
--
-- Grain : une ligne par (territory, type, year). `id` = territory || '_' || type
-- est la clé métier d'un territoire, année exclue : elle se répète d'un millésime
-- à l'autre (unique seulement au sein d'un `year`, et parmi les lignes
-- `is_latest`). La résolution exacte d'un `id` par l'API se fait sur `is_latest`.
--
-- Multi-millésime : `is_latest` isole le dernier référentiel (comportement de
-- l'index Meilisearch actuel), `year` permet de cibler un millésime précis.
--
-- Source : `perimeters_agg`, déjà éclaté par niveau (com/epci/aom/dep/reg/country)
-- et dédoublonné par `mode()` sur le libellé. On écarte :
--   * le sentinel étranger `XXXXX` ;
--   * l'artefact « pays agrégé en type=com » que `perimeters_agg` ajoute pour les
--     modèles od_* — il ferait un doublon de `code` avec la ligne `type=country`.
--
-- La recherche insensible aux accents s'appuie sur l'index GIN trigram
-- `immutable_unaccent(lower(l_territory))` (cf. migration `0005_search_extensions`).

WITH latest_millesime AS (
  SELECT max(year) AS year FROM {{ ref('perimeters_agg') }}
),

territories AS (
  SELECT
    pa.year,
    pa.code,
    pa.type,
    pa.libelle
  FROM {{ ref('perimeters_agg') }} AS pa
  WHERE
    pa.code IS NOT NULL
    AND pa.code <> 'XXXXX'
    AND NOT (
      pa.type = 'com'
      AND EXISTS (
        SELECT 1
        FROM {{ ref('perimeters_agg') }} AS c
        WHERE c.type = 'country' AND c.code = pa.code AND c.year = pa.year
      )
    )
)

SELECT
  t.code || '_' || t.type                     AS id,
  t.code                                       AS territory,
  mode() WITHIN GROUP (ORDER BY t.libelle)     AS l_territory,
  t.type,
  t.year,
  t.year = (SELECT year FROM latest_millesime) AS is_latest
FROM territories AS t
GROUP BY t.code, t.type, t.year
