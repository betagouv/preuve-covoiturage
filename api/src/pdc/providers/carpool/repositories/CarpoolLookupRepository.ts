import { provider } from "@/ilos/common/index.ts";
import {
  PoolClient,
  PostgresConnection,
} from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "../helpers/sql.ts";
import {
  SelectableCarpool,
  SelectableCarpoolStatus,
} from "../interfaces/database/lookup.ts";
import { Id, Uuid } from "../interfaces/index.ts";

@provider()
export class CarpoolLookupRepository {
  readonly table = "carpool_v2.carpools";
  readonly statusTable = "carpool_v2.status";
  readonly incentiveTable = "carpool_v2.operator_incentives";

  constructor(protected connection: PostgresConnection) {}

  public async countJourneyBy(
    identity_key: string[],
    start_date?: {
      min?: Date;
      max?: Date;
    },
    end_date?: {
      min?: Date;
      max?: Date;
    },
    operator_trip_id?: string,
    client?: PoolClient,
  ): Promise<number> {
    const cl = client ?? this.connection.getClient();
    const filters = [
      sql`(${
        join([
          sql`cc.driver_identity_key = ANY(${identity_key})`,
          sql`cc.passenger_identity_key = ANY(${identity_key})`,
        ], " OR ")
      })`,
      sql`cs.acquisition_status <> ANY('{canceled,expired,terms_violation_error}'::carpool_v2.carpool_acquisition_status_enum[]) `,
    ];

    if (start_date) {
      if (start_date.max) {
        filters.push(sql`cc.start_datetime < ${start_date.max}`);
      }
      if (start_date.min) {
        filters.push(sql`cc.start_datetime >= ${start_date.min}`);
      }
    }

    if (end_date) {
      if (end_date.max) {
        filters.push(sql`cc.end_datetime < ${end_date.max}`);
      }
      if (end_date.min) {
        filters.push(sql`cc.end_datetime >= ${end_date.min}`);
      }
    }

    if (operator_trip_id) {
      filters.push(sql`cc.operator_trip_id <> ${operator_trip_id}`);
    }

    // operator_trip_id should be unique
    // it may occurs some conflict between operators
    // maybe use a composite count distinct
    const sqlQuery = sql`
      SELECT
        count(distinct cc.operator_trip_id)
      FROM ${raw(this.table)} AS cc
      JOIN ${raw(this.statusTable)} AS cs
        ON cs.carpool_id = cc._id
      WHERE
      ${join(filters, " AND ")}
    `;

    const result = await cl.query<{ count: string }>(sqlQuery);
    return parseInt(result.rows.pop()?.count || "0", 10);
  }

  public async findOneStatus(
    operator_id: Id,
    operator_journey_id: Uuid,
    client?: PoolClient,
  ): Promise<SelectableCarpoolStatus | undefined> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      SELECT
        cc._id,
        cc.created_at,
        cc.updated_at,
        cc.operator_id,
        cc.operator_journey_id,
        cc.operator_trip_id,
        ca.acquisition_status,
        ca.fraud_status
      FROM ${raw(this.table)} AS cc
      JOIN ${raw(this.statusTable)} AS ca
        ON ca.carpool_id = cc._id
      WHERE
        cc.operator_id = ${operator_id} AND
        cc.operator_journey_id = ${operator_journey_id}
      LIMIT 1
    `;
    const result = await cl.query<SelectableCarpoolStatus>(sqlQuery);
    return result.rows.pop();
  }

  public async findOne(
    operator_id: Id,
    operator_journey_id: Uuid,
    client?: PoolClient,
  ): Promise<SelectableCarpool | undefined> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      SELECT
        cc.*,
        json_build_object(
          'lat', ST_Y(cc.start_position::geometry),
          'lon', ST_X(cc.start_position::geometry)
        ) AS start_position,
        json_build_object(
          'lat', ST_Y(cc.end_position::geometry),
          'lon', ST_X(cc.end_position::geometry)
        ) AS end_position,
        ca.acquisition_status,
        ca.fraud_status
      FROM ${raw(this.table)} AS cc
      JOIN ${raw(this.statusTable)} AS ca
        ON ca.carpool_id = cc._id
      WHERE
        cc.operator_id = ${operator_id} AND
        cc.operator_journey_id = ${operator_journey_id}
      LIMIT 1
    `;
    const carpoolResult = await cl.query(sqlQuery);
    const carpool = carpoolResult.rows.pop();
    if (!carpool) {
      return;
    }

    const incentiveResult = await cl.query(sql`
      SELECT idx, siret, amount FROM ${raw(this.incentiveTable)} 
      WHERE carpool_id = ${carpool._id}
    `);

    return {
      ...carpool,
      incentives: incentiveResult.rows.map(({ idx, siret, amount }) => ({
        index: idx,
        siret,
        amount,
      })),
    };
  }
}
