{{ config(materialized='incremental',
  unique_key=['year', 'month', 'territory_id', 'direction', 'operator_id'],
  post_hook=[
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operators_by_month_pkey') THEN ALTER TABLE {{ this }} ADD CONSTRAINT operators_by_month_pkey PRIMARY KEY (year, month, territory_id, direction, operator_id); END IF; END $$;"
      "CREATE INDEX IF NOT EXISTS operators_by_month_idx ON {{ this }} using btree(year, month, territory_id, direction, operator_id)",
    ]
) }}

SELECT
  extract('year' FROM start_date)::int  AS year,
  extract('month' FROM start_date)::int AS month,
  territory_id,
  direction,
  operator_id,
  operator_name,
  sum(journeys)    AS journeys,
  sum(incented_journeys) AS incented_journeys,
  sum(incentive_amount) AS incentive_amount
FROM {{ ref('operators_by_day') }} AS a
{% if is_incremental() %}
  WHERE
    (extract('year' FROM start_date) * 100 + extract('month' FROM start_date))
    >= (SELECT max(year * 100 + month) FROM {{ this }})
{% endif %}
GROUP BY 1, 2, 3, 4, 5, 6