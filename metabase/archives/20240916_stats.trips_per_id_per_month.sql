 WITH data AS (
         SELECT ci_1.uuid,
            date_trunc('month'::text, cc.datetime) AS month,
            count(DISTINCT cc.trip_id) AS trips
           FROM carpool.carpools cc
             JOIN carpool.identities ci_1 ON cc.identity_id = ci_1._id
          WHERE cc.datetime >= '2021-01-01 00:00:00+00'::timestamp with time zone AND cc.datetime < '2022-07-01 00:00:00+00'::timestamp with time zone
          GROUP BY ci_1.uuid, (date_trunc('month'::text, cc.datetime))
          ORDER BY (date_trunc('month'::text, cc.datetime)), ci_1.uuid DESC
        ), list AS (
         SELECT data.uuid,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-01-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS jan_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-02-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS fev_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-03-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS mar_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-04-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS avr_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-05-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS mai_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-06-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS jun_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-07-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS jul_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-08-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS aou_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-09-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS sep_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-10-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS oct_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-11-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS nov_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2021-12-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS dec_21,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-01-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS jan_22,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-02-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS fev_22,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-03-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS mar_22,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-04-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS avr_22,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-05-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS mai_22,
            COALESCE(sum(data.trips) FILTER (WHERE data.month = '2022-06-01 00:00:00+00'::timestamp with time zone), 0::numeric) AS jun_22,
            sum(data.trips) AS total,
            trunc(avg(data.trips), 1) AS avg
           FROM data
          GROUP BY data.uuid
        )
  SELECT DISTINCT list.uuid,
    list.jan_21,
    list.fev_21,
    list.mar_21,
    list.avr_21,
    list.mai_21,
    list.jun_21,
    list.jul_21,
    list.aou_21,
    list.sep_21,
    list.oct_21,
    list.nov_21,
    list.dec_21,
    list.jan_22,
    list.fev_22,
    list.mar_22,
    list.avr_22,
    list.mai_22,
    list.jun_22,
    list.total,
    list.avg,
    concat(ci.phone, ci.phone_trunc) AS phone,
    ci.operator_user_id,
    concat(ci.firstname, ' ', ci.lastname) AS name
   FROM list
     JOIN carpool.identities ci ON ci.uuid = list.uuid
  ORDER BY list.avg DESC;