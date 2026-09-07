-- Détecte une régression silencieuse dans le plumbing with_incentives : le
-- total des incitations évitées sur les carpools frauduleux doit
-- correspondre entre l'agrégat et trusted.carpools, sur la même fenêtre
-- incrémentale.
{{ config(severity='warn', tags=['aggregated', 'fraud']) }}

{% set fraud_window %}
  {{ window_start(
    ref('fraud_month_country_from'),
    'incremental_date',
    type='timestamp',
    default_start="'2020-01-01 00:00:00'",
    lookback_nb=1,
    lookback_unit='month'
  ) }}
{% endset %}

SELECT 1 AS failure
WHERE (
  SELECT COALESCE(SUM(avoided_incentives), 0)
  FROM {{ ref('fraud_month_country_from') }}
  WHERE incremental_date::timestamp >= {{ fraud_window }}
) != (
  -- même population géo que le modèle, sinon écart permanent
  WITH filtered_carpools AS (
    {{ filtered_carpools(
      perim='country',
      with_new_users=false,
      with_valid=false,
      strict=true
    ) }}
  )
  SELECT
    COALESCE(
      SUM(campaigns_result_total) FILTER (WHERE fraud_status = 'failed'), 0
    )
  FROM filtered_carpools
  WHERE
    start_code IS NOT NULL
    AND carpool_datetime >= {{ fraud_window }}
    AND carpool_datetime <= CURRENT_TIMESTAMP
)
