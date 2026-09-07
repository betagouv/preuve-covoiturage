{{ config(
  materialized='table',
  indexes=[
    { 'columns': ['_id'], 'unique': true }
  ],
  tags=['trusted', 'operators', 'daily']
) }}

SELECT
  _id,
  name,
  siret
FROM {{ source('dlk_import', 'operator_operators') }}
WHERE deleted_at IS NULL
