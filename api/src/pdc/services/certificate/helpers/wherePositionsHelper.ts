import sql, { join, Sql } from "@/lib/pg/sql.ts";
import { PointInterface } from "@/shared/common/interfaces/PointInterface.ts";

// deno-fmt-ignore
export function wherePositionsHelper(positions: PointInterface[], radius = 1000): Sql {
  const list = positions.reduce((prev: Sql[], pos: PointInterface): Sql[] => {
    prev.push(sql`ST_Distance(ST_MakePoint(${pos.lon}, ${pos.lat}), cc.start_position) < ${radius}`);
    prev.push(sql`ST_Distance(ST_MakePoint(${pos.lon}, ${pos.lat}), cc.end_position) < ${radius}`);
    return prev;
  }, []);

  return list.length ? sql`AND (${join(list, " OR ")})` : sql``;
}
