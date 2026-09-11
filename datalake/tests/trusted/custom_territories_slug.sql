{{ config(severity='error', tags=['trusted', 'geo', 'custom_territories']) }}

-- Le code d'un territoire custom est un slug (jamais purement numérique) : c'est ce qui
-- garantit l'absence de collision avec les codes SIREN/INSEE des autres types dans
-- perimeters_agg (clé unique code, type, year).
SELECT code
FROM {{ ref('custom_territories_meta') }}
WHERE code !~ '^[a-z0-9-]{3,32}$' OR code ~ '^[0-9]+$'
