import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Id, Uuid } from '../interfaces';
import { SelectableCarpool, SelectableCarpoolStatus } from '../interfaces/database/lookup';
import sql, { raw } from '../helpers/sql';

@provider()
export class CarpoolLookupRepository {
  readonly table = 'carpool_v2.carpools';
  readonly statusTable = 'carpool_v2.status';
  readonly incentiveTable = 'carpool_v2.operator_incentives';

  constructor(protected connection: PostgresConnection) {}

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
      legacy_id: parseInt(carpool.legacy_id, 10),
      incentives: incentiveResult.rows.map(({ idx, siret, amount }) => ({ index: idx, siret, amount })),
    };
  }
}
