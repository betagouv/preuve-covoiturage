         SELECT perimeters.com
           FROM geo.perimeters
          WHERE perimeters.aom::text = '287500078'::text AND perimeters.year = 2023
        ), idfm_phone_and_oui AS (
         SELECT DISTINCT ON (ci.phone_trunc, ci.operator_user_id) ci.phone_trunc,
            ci.operator_user_id,
            cc.operator_id,
            cc.operator_journey_id,
            cc.datetime
           FROM carpool.identities ci
             JOIN carpool.carpools cc ON cc.identity_id = ci._id
             JOIN idfm_coms oc ON cc.start_geo_code::text = oc.com::text OR cc.end_geo_code::text = oc.com::text
          WHERE cc.datetime > '2022-01-01 00:00:00+00'::timestamp with time zone
        ), occitanie_coms AS (
         SELECT perimeters.com
           FROM geo.perimeters
          WHERE perimeters.aom::text = '200053791'::text AND perimeters.year = 2023
        ), occitanie_phone_and_oui AS (
         SELECT DISTINCT ON (ci.phone_trunc, ci.operator_user_id) ci.phone_trunc,
            ci.operator_user_id,
            cc.operator_id,
            cc.operator_journey_id,
            cc.datetime
           FROM carpool.identities ci
             JOIN carpool.carpools cc ON cc.identity_id = ci._id
             JOIN occitanie_coms oc ON cc.start_geo_code::text = oc.com::text OR cc.end_geo_code::text = oc.com::text
          WHERE cc.datetime > '2022-01-01 00:00:00+00'::timestamp with time zone
        ), lyon_metropole_coms AS (
         SELECT perimeters.com
           FROM geo.perimeters
          WHERE perimeters.epci::text = '200046977'::text AND perimeters.year = 2023
        ), lyon_phone_and_oui AS (
          SELECT DISTINCT ON (ci.phone_trunc, ci.operator_user_id) ci.phone_trunc,
            ci.operator_user_id,
            cc.operator_id,
            cc.operator_journey_id,
            cc.datetime
           FROM carpool.identities ci
             JOIN carpool.carpools cc ON cc.identity_id = ci._id
             JOIN lyon_metropole_coms oc ON cc.start_geo_code::text = oc.com::text OR cc.end_geo_code::text = oc.com::text
          WHERE cc.datetime > '2023-01-01 00:00:00+00'::timestamp with time zone
        ), pdll_coms AS (
         SELECT perimeters.com
           FROM geo.perimeters
          WHERE perimeters.reg::text = '52'::text AND perimeters.year = 2023
        ), pdll_phone_and_oui AS (
         SELECT DISTINCT ON (ci.phone_trunc, ci.operator_user_id) ci.phone_trunc,
            ci.operator_user_id,
            cc.operator_id,
            cc.operator_journey_id,
            cc.datetime
           FROM carpool.identities ci
             JOIN carpool.carpools cc ON cc.identity_id = ci._id
             JOIN pdll_coms oc ON cc.start_geo_code::text = oc.com::text OR cc.end_geo_code::text = oc.com::text
          WHERE cc.datetime > '2022-01-01 00:00:00+00'::timestamp with time zone
        ), grouped_oui_phone AS (
         SELECT idfm_phone_and_oui.phone_trunc,
            idfm_phone_and_oui.operator_id,
            array_agg(idfm_phone_and_oui.operator_journey_id) AS oji_agg,
            array_agg(idfm_phone_and_oui.operator_user_id) AS oui_agg,
            count(idfm_phone_and_oui.operator_user_id) AS oui_agg_length,
            max(idfm_phone_and_oui.datetime) AS last_date_trip,
            'idfm'::text AS aom,
            '287500078'::text AS insee
           FROM idfm_phone_and_oui
          WHERE idfm_phone_and_oui.phone_trunc IS NOT NULL
          GROUP BY idfm_phone_and_oui.phone_trunc, idfm_phone_and_oui.operator_id
                UNION ALL
         SELECT occitanie_phone_and_oui.phone_trunc,
            occitanie_phone_and_oui.operator_id,
            array_agg(occitanie_phone_and_oui.operator_journey_id) AS oji_agg,
            array_agg(occitanie_phone_and_oui.operator_user_id) AS oui_agg,
            count(occitanie_phone_and_oui.operator_user_id) AS oui_agg_length,
            max(occitanie_phone_and_oui.datetime) AS last_date_trip,
            'occitanie'::text AS aom,
            '200053791'::text AS insee
           FROM occitanie_phone_and_oui
          WHERE occitanie_phone_and_oui.phone_trunc IS NOT NULL
          GROUP BY occitanie_phone_and_oui.phone_trunc, occitanie_phone_and_oui.operator_id
        UNION ALL
         SELECT pdll_phone_and_oui.phone_trunc,
            pdll_phone_and_oui.operator_id,
            array_agg(pdll_phone_and_oui.operator_journey_id) AS oji_agg,
            array_agg(pdll_phone_and_oui.operator_user_id) AS oui_agg,
            count(pdll_phone_and_oui.operator_user_id) AS oui_agg_length,
            max(pdll_phone_and_oui.datetime) AS last_date_trip,
            'pdll'::text AS aom,
            '52'::text AS insee
           FROM pdll_phone_and_oui
          WHERE pdll_phone_and_oui.phone_trunc IS NOT NULL
          GROUP BY pdll_phone_and_oui.phone_trunc, pdll_phone_and_oui.operator_id
        UNION ALL
         SELECT lyon_phone_and_oui.phone_trunc,
            lyon_phone_and_oui.operator_id,
            array_agg(lyon_phone_and_oui.operator_journey_id) AS oji_agg,
            array_agg(lyon_phone_and_oui.operator_user_id) AS oui_agg,
            count(lyon_phone_and_oui.operator_user_id) AS oui_agg_length,
            max(lyon_phone_and_oui.datetime) AS last_date_trip,
            'lyon'::text AS aom,
            '200046977'::text AS insee
           FROM lyon_phone_and_oui
          WHERE lyon_phone_and_oui.phone_trunc IS NOT NULL
          GROUP BY lyon_phone_and_oui.phone_trunc, lyon_phone_and_oui.operator_id
        )
  SELECT grouped_oui_phone.phone_trunc,
    grouped_oui_phone.operator_id,
    grouped_oui_phone.oui_agg,
    grouped_oui_phone.oji_agg,
    grouped_oui_phone.oui_agg_length,
    grouped_oui_phone.last_date_trip,
    grouped_oui_phone.aom,
    grouped_oui_phone.insee
   FROM grouped_oui_phone
  WHERE grouped_oui_phone.oui_agg_length > 2
  ORDER BY grouped_oui_phone.oui_agg_length DESC;
  