-- Pas de fenêtre : materialized='table', snapshot complet à chaque run.
{{ config(severity='warn', tags=['trusted', 'operators']) }}

SELECT 1 AS failure
WHERE (
  SELECT COUNT(*) FROM {{ source('dlk_import', 'operator_operators') }} WHERE deleted_at IS NULL
) != (
  SELECT COUNT(*) FROM {{ ref('operator') }}
)
