 WITH unnestedtrips AS (
         SELECT unnest(phone_insights.trip_id_list) AS trip_id,
            EXTRACT(month FROM phone_insights.departure_date) AS month
           FROM fraudcheck.phone_insights
          WHERE phone_insights.intraday_change_count >= 2 AND phone_insights.departure_date >= date_trunc('month'::text, CURRENT_DATE - '3 mons'::interval) AND phone_insights.departure_date < date_trunc('month'::text, CURRENT_DATE::timestamp with time zone)
        )
 SELECT c.start_geo_code AS "Origine",
    c.end_geo_code AS "Destination",
    COALESCE(sum(
        CASE
            WHEN ut.month = EXTRACT(month FROM CURRENT_DATE - '1 mon'::interval) THEN 1
            ELSE 0
        END), 0::bigint) AS "Mois-1",
    COALESCE(sum(
        CASE
            WHEN ut.month = EXTRACT(month FROM CURRENT_DATE - '2 mons'::interval) THEN 1
            ELSE 0
        END), 0::bigint) AS "Mois-2",
    COALESCE(sum(
        CASE
            WHEN ut.month = EXTRACT(month FROM CURRENT_DATE - '3 mons'::interval) THEN 1
            ELSE 0
        END), 0::bigint) AS "Mois-3",
    array_to_string(array_agg(DISTINCT c.operator_id), ', '::text) AS "Opérateur(s)",
    count(*) AS "Nombre de Trajets des 3 derniers mois"
   FROM unnestedtrips ut
     JOIN carpool.carpools c ON ut.trip_id::text = c.operator_journey_id::text
  GROUP BY c.start_geo_code, c.end_geo_code
  ORDER BY (count(*)) DESC
 LIMIT 30;