import { provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection, PoolClient } from "@/ilos/connection-postgres/index.ts";
import { logger } from "@/lib/logger/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
import { DatabaseException } from "@/pdc/providers/carpool/exceptions/DatabaseException.ts";
import { CarpoolGeo, Id, Position, UpsertableCarpoolGeo } from "../interfaces/index.ts";

@provider()
export class CarpoolGeoRepository {
  readonly table = "carpool_v2.geo";
  readonly carpoolTable = "carpool_v2.carpools";

  constructor(protected connection: LegacyPostgresConnection) {}

  async findOne(carpool_id: Id, client?: PoolClient): Promise<CarpoolGeo | null> {
    const cl = client ?? (await this.connection.getClient().connect());
    try {
      const result = await cl.query<CarpoolGeo>(sql`
        SELECT _id, carpool_id, start_geo_code, end_geo_code, errors
        FROM ${raw(this.table)}
        WHERE carpool_id = ${carpool_id}
      `);

      return result.rows[0] ?? null;
    } catch (e) {
      logger.error(`[carpool-geo] error finding carpool geo for ${carpool_id}: ${e.message}`);
      throw new DatabaseException(e.message);
    } finally {
      if (!client) {
        cl.release();
      }
    }
  }

  async findProcessable(
    search: { limit: number; from: Date; to: Date; failedOnly?: boolean },
    client: PoolClient,
  ): Promise<Array<{ carpool_id: Id; start: Position; end: Position }>> {
    const failedOnlyClause = !search.failedOnly
      ? raw(` AND cg._id IS NULL`)
      : raw(` AND ( cg.start_geo_code IS NULL OR cg.end_geo_code IS NULL )`);

    const query = sql`
        SELECT 
          cc._id,
          ST_X(cc.start_position::geometry)::numeric as start_lon,
          ST_Y(cc.start_position::geometry)::numeric as start_lat,
          ST_X(cc.end_position::geometry)::numeric as end_lon,
          ST_Y(cc.end_position::geometry)::numeric as end_lat
        FROM ${raw(this.carpoolTable)} cc
        LEFT JOIN ${raw(this.table)} cg
          ON cg.carpool_id = cc._id
        WHERE 
          cc.start_datetime >= ${search.from} AND
          cc.start_datetime < ${search.to}
          ${failedOnlyClause}
        ORDER BY cc.start_datetime
        LIMIT ${search.limit}
    `;

    const result = await client.query(query);

    return result.rows.map((r) => ({
      carpool_id: r._id,
      start: {
        lat: parseFloat(r.start_lat),
        lon: parseFloat(r.start_lon),
      },
      end: {
        lat: parseFloat(r.end_lat),
        lon: parseFloat(r.end_lon),
      },
    }));
  }

  public async upsert(data: UpsertableCarpoolGeo, client: PoolClient): Promise<void> {
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        carpool_id, start_geo_code, end_geo_code, errors
      ) VALUES (
        ${data.carpool_id},
        ${"start_geo_code" in data ? data.start_geo_code : null},
        ${"end_geo_code" in data ? data.end_geo_code : null},
        ${JSON.stringify("error" in data ? [data.error] : [])}
      )
      ON CONFLICT (carpool_id)
      DO UPDATE
      SET
        start_geo_code = excluded.start_geo_code,
        end_geo_code = excluded.end_geo_code,
        errors = excluded.errors::jsonb
    `;
    await client.query(sqlQuery);
  }

  public async delete(carpool_id: Id, client?: PoolClient): Promise<void> {
    const cl = client ?? (await this.connection.getClient().connect());
    try {
      await cl.query(sql`
        DELETE FROM ${raw(this.table)}
        WHERE carpool_id = ${carpool_id}
      `);
    } catch (e) {
      logger.error(`[carpool-geo] error deleting carpool geo for ${carpool_id}: ${e.message}`);
      throw new DatabaseException(e.message);
    } finally {
      if (!client) {
        cl.release();
      }
    }
  }
}
