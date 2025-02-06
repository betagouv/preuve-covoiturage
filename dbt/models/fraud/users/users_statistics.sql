{{
  config(
    materialized = 'table',
    tags=["fraud"],
    unique_key='user_identity_key',
    indexes = [
      {
        "columns":["user_identity_key"],
        "unique": true
      }
    ]
  )
}}

with incentives as (
select 
	carpool_id,
	sum(amount) as total_incentive_amount
from {{ source('carpool', 'operator_incentives') }} 
group by 1
),

trips as (
  select
    _id,
    user_identity_key,
    role,
    operator_trip_id,
    operator_journey_id,
    start_datetime,
    end_datetime,
    distance,
    operator_id,
    passenger_seats
  from
    {{ ref('users_trips') }}
),

stats as (select 
	c.user_identity_key,
  {{ create_sql_statements_for_users_stats('count(distinct operator_trip_id)','num_trips') }}, -- noqa disable=all
  {{ create_sql_statements_for_users_stats('count(distinct operator_journey_id)','num_journeys') }},
  {{ create_sql_statements_for_users_stats('min(start_datetime)','datetime_first_trip') }},
  {{ create_sql_statements_for_users_stats('max(start_datetime)','datetime_last_trip') }},
  {{ create_sql_statements_for_users_stats('avg(end_datetime-start_datetime)','average_journey_duration') }},
  {{ create_sql_statements_for_users_stats('avg(distance)','average_journey_distance') }},
  {{ create_sql_statements_for_users_stats('min(distance)','min_journey_distance') }},
  {{ create_sql_statements_for_users_stats('max(distance)','max_journey_distance') }},
  {{ create_sql_statements_for_users_stats('count(distinct date_trunc(\'day\',start_datetime))','total_traveled_days') }},
  {{ create_sql_statements_for_users_stats('count(distinct operator_id)','num_unique_operators') }},
  {{ create_sql_statements_for_users_stats('array_agg(distinct c.operator_id)','list_distinct_operators') }},
  {{ create_sql_statements_for_users_stats('avg(passenger_seats)','average_passenger_seats') }},
  {{ create_sql_statements_for_users_stats('sum((date_part(\'hour\',start_datetime)<5 OR date_part(\'hour\',start_datetime)>22)::int)','num_nightime_22_5_trips') }},
	sum(i.total_incentive_amount) as total_incentives_as_driver -- noqa enable=all
from trips c 
left join incentives i  on c._id= i.carpool_id and role='driver'
group by 1)

select
  s.*,
  uircs.total_consecutives_intraday_role_changes,
  uircs.avg_daily_consecutives_intraday_role_changes,
  uircs.max_daily_consecutives_intraday_role_changes
from stats s
left join {{ ref('users_intraday_role_change_stats') }} uircs on s.user_identity_key=uircs.user_identity_key