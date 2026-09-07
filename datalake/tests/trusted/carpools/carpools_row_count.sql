{{ config(severity='warn', tags=['trusted', 'carpools']) }}

SELECT 1 AS failure
WHERE (
  SELECT COUNT(*) FROM {{ source('dlk_import', 'carpool_v2_carpools') }}
  WHERE
    start_datetime
    >= {{ window_start(ref('carpools'), 'start_datetime', lookback_nb=3) }}
    AND start_datetime <= CURRENT_TIMESTAMP
) != (
  SELECT COUNT(*) FROM {{ ref('carpools') }}
  WHERE
    start_datetime
    >= {{ window_start(ref('carpools'), 'start_datetime', lookback_nb=3) }}
    AND start_datetime <= CURRENT_TIMESTAMP
)
