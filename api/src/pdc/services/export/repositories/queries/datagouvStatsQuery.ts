import sql, { Sql } from "@/lib/pg/sql.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { DataGouvQueryConfig } from "@/pdc/services/export/repositories/CarpoolRepository.ts";

/**
 * Nombre trajets collectés et validés par le registre de preuve de covoiturage 1025610
 * Nombre de trajets exposés dans le jeu de données : 998086
 * Nombre de trajets supprimés du jeu de données : 27524 = 14958 + 15373 - 2807
 *     Nombre de trajets dont l’occurrence du code INSEE de départ est < 6 : 14958
 *     Nombre de trajets dont l’occurrence du code INSEE d’arrivée est < 6 : 15373
 *     Nombre de trajets dont l’occurrence du code INSEE de départ ET d’arrivée est < 6 : 2807
 */
export type DataGouvStatsType = {
  start_at: Date;
  end_at: Date;
  count_total: number;
  count_exposed: number;
  count_removed: number;
  count_removed_start: number;
  count_removed_end: number;
  count_removed_both: number;
};

export function datagouvStatsQuery(params: ExportParams, config: DataGouvQueryConfig): Sql {
  const { start_at } = params.get();
  const { min_occurrences, acquisition_status } = config;
  const end_at = new Date("2025-04-01T02:00:00Z");

  return sql`
    WITH

    -- fetch the carpool_id of the carpools that have
    -- less than min_occurrences start or end geo codes
    exclude_start_full AS (
      SELECT cg.start_geo_code, array_agg(cc._id) as _id
      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}
      GROUP BY 1
      HAVING COUNT(cg.start_geo_code) < ${min_occurrences}
    ),

    exclude_end_full AS (
      SELECT cg.end_geo_code, array_agg(cc._id) AS _id
      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}
      GROUP BY 1
      HAVING COUNT(cg.end_geo_code) < ${min_occurrences}
    ),

    exclude_count_start AS (
      SELECT COUNT(*) FROM (SELECT UNNEST(_id) AS _id FROM exclude_start_full GROUP BY 1) a
    ),

    exclude_count_end AS (
      SELECT COUNT(*) FROM (SELECT UNNEST(_id) AS _id FROM exclude_end_full GROUP BY 1) a
    ),

    exclude_union AS (
      SELECT COUNT(*) FROM (
        SELECT * FROM (
          SELECT UNNEST(_id) AS _id FROM exclude_start_full GROUP BY 1
          UNION ALL
          SELECT UNNEST(_id) AS _id FROM exclude_end_full GROUP BY 1
        ) AS e
        GROUP BY 1
      ) a
    ),

    exclude_intersect AS (
      SELECT COUNT(*) FROM (
        SELECT * FROM (
          SELECT UNNEST(_id) AS _id FROM exclude_start_full GROUP BY 1
          UNION ALL
          SELECT UNNEST(_id) AS _id FROM exclude_end_full GROUP BY 1
        ) AS e
        GROUP BY 1
        HAVING COUNT(*) > 1
      ) a
    ),

    count_total AS (
      SELECT COUNT(*)
      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}
    )

    SELECT
      ${start_at} as start_at,
      ${end_at} as end_at,
      count_total.count as count_total,
      (count_total.count - exclude_union.count) as count_exposed,
      exclude_union.count as count_removed,
      exclude_count_start.count as count_removed_start,
      exclude_count_end.count as count_removed_end,
      exclude_intersect.count as count_removed_both
    FROM count_total, exclude_count_start, exclude_count_end, exclude_union, exclude_intersect
  `;
}
