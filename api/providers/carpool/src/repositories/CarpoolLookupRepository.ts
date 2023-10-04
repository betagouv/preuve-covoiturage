import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Id, IncentiveCounterpartTarget, Uuid } from '../interfaces';
import { SelectableCarpool, SelectableCarpoolStatus } from '../interfaces/database/lookup';
import sql, { raw } from '../helpers/sql';

@provider()
export class CarpoolLookupRepository {
  readonly table = 'carpool_v2.carpools';
  readonly statusTable = 'carpool_v2.status';
  readonly incentiveTable = 'carpool_v2.operator_incentives';
  readonly incentiveCounterpartTable = 'carpool_v2.operator_incentive_counterparts';

  constructor(protected connection: PostgresConnection) {}

  public async findOneStatus(
    operator_id: Id,
    operator_journey_id: Uuid,
    client?: PoolClient,
  ): Promise<SelectableCarpoolStatus> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      SELECT
        cc._id,
        cc.created_at,
        cc.updated_at,
        cc.operator_id,
        cc.operator_journey_id,
        cc.operator_trip_id,
        ca.acquisition_last_event_id,
        ca.acquisition_status,
        ca.incentive_last_event_id,
        ca.incentive_status,
        ca.fraud_last_event_id,
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

  public async findOne(operator_id: Id, operator_journey_id: Uuid, client?: PoolClient): Promise<SelectableCarpool> {
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
        ca.acquisition_last_event_id,
        ca.acquisition_status,
        ca.incentive_last_event_id,
        ca.incentive_status,
        ca.fraud_last_event_id,
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

    const incentiveCounterpartResult = await cl.query(sql`
      SELECT target_is_driver, siret, amount FROM ${raw(this.incentiveCounterpartTable)} 
      WHERE carpool_id = ${carpool._id}
    `);
    return {
      ...carpool,
      incentives: incentiveResult.rows.map(({ idx, siret, amount }) => ({ index: idx, siret, amount })),
      incentive_counterparts: incentiveCounterpartResult.rows.map(({ target_is_driver, siret, amount }) => ({
        target: target_is_driver ? IncentiveCounterpartTarget.Driver : IncentiveCounterpartTarget.Passenger,
        siret,
        amount,
      })),
    };
  }
}
