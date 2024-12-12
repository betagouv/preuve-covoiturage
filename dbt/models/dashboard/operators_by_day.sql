{{ config(
    materialized='incremental',
    unique_key=['territory_id', 'direction', 'start_date', 'operator_id'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'operators_by_day_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT operators_by_day_pkey PRIMARY KEY (territory_id, direction, start_date, operator_id); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS operators_by_day_idx ON {{ this }} using btree(territory_id, direction, start_date, operator_id)',
    ]
  )
}}
with directions as (
  select
    "from"          as territory_id,
    'from'          as direction,
    start_date,
    operator_id,
    operator_name,
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where "from" = "to"), 0
    )               as intra_journeys,
    sum(incented_journeys)   as incented_journeys,
    coalesce(
      sum(incented_journeys) filter (where "from" = "to"), 0
    )               as intra_incented_journeys,
    sum(incentive_amount)    as incentive_amount,
    coalesce(
      sum(incentive_amount) filter (where "from" = "to"), 0
    )               as intra_incentive_amount
  from {{ ref('carpools_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 3, 4, 5
  union
  select
    "to"                 as territory_id,
    'to'                 as direction,
    start_date,
    operator_id,
    operator_name,
    sum(journeys)   as journeys,
    coalesce(
      sum(journeys) filter (where "from" = "to"), 0
    )               as intra_journeys,
    sum(incented_journeys)   as incented_journeys,
    coalesce(
      sum(incented_journeys) filter (where "from" = "to"), 0
    )               as intra_incented_journeys,
    sum(incentive_amount)    as incentive_amount,
    coalesce(
      sum(incentive_amount) filter (where "from" = "to"), 0
    )               as intra_incentive_amount
  from {{ ref('carpools_by_day') }}
  {% if is_incremental() %}
    where start_date >= (select max(start_date) from {{ this }})
  {% endif %}
  group by 1, 3, 4, 5
)

select
  territory_id,
  start_date,
  direction,
  operator_id,
  operator_name,
  sum(journeys)         as journeys,
  sum(incented_journeys) as incented_journeys,
  sum(incentive_amount) as incentive_amount
from directions
where territory_id is not null
group by 1, 2, 3, 4, 5
union
select
  territory_id,
  start_date,
  'both' as direction, 
  operator_id,
  operator_name,                                           
  sum(journeys) - sum(intra_journeys)               as journeys,
  sum(incented_journeys) - sum(intra_incented_journeys) as incented_journeys,
  sum(incentive_amount) - sum(intra_incentive_amount) as incentive_amount
from directions
where territory_id is not null
group by 1, 2, 3, 4, 5