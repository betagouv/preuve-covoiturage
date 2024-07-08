{{ config(materialized='incremental') }}

select 
	extract('year' from b.start_datetime) as year,
	a.siret,
	case when d.territory is not null then d.l_territory else c.legal_name end as name,
	sum(a.amount)/100 as amount 
from {{ source('carpool', 'operator_incentives') }} a
left join {{ source('carpool', 'carpools') }} b on a.carpool_id = b._id
left join {{ source('company', 'companies') }} c on a.siret = c.siret
left join (select distinct on (territory) territory,l_territory from {{ source('geo', 'perimeters_centroid') }} where type in ('aom','epci')) d on left(a.siret,9) = d.territory
{% if is_incremental() %}
  WHERE
    concat(
        extract('year' FROM b.start_datetime),
        extract('month' FROM b.start_datetime)
      )::int
      >= (SELECT max(concat(year, month)::int) FROM {{ this }})
{% endif %}
group by 1, 2, 3
order by 1 , 4