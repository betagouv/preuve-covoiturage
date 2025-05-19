import sql, { raw, Sql } from "@/lib/pg/sql.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";

export function carpoolCountQuery(params: ExportParams): Sql {
  const { start_at, end_at } = params.get();
  const geo_selectors = params.geoToSQL();
  const operator_id = params.operatorToSQL();
  const year = 2023;

  return sql`
    SELECT count(cc.*) as count
    FROM carpool_v2.carpools cc

    LEFT JOIN carpool_v2.status cs ON cc._id = cs.carpool_id

    -- geo selection
    LEFT JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
    LEFT JOIN geo.perimeters gps ON cg.start_geo_code = gps.arr AND gps.year = ${year}::smallint
    LEFT JOIN geo.perimeters gpe ON cg.end_geo_code = gpe.arr AND gpe.year = ${year}::smallint

    WHERE true
      AND cc.start_datetime >= ${start_at}
      AND cc.start_datetime <  ${end_at}
      AND cs.acquisition_status = 'processed'
        ${raw(geo_selectors)}
        ${raw(operator_id)}
    `;
}
