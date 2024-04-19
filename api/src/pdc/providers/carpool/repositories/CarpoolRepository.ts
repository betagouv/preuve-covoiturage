import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import sql, { bulk, join, raw } from '../helpers/sql';
import { CarpoolIncentive, Id, InsertableCarpool, UpdatableCarpool, Uuid, WrittenCarpool } from '../interfaces';
import { DatabaseException } from '../exceptions/DatabaseException';

@provider()
export class CarpoolRepository {
  readonly table = 'carpool_v2.carpools';
  readonly incentiveTable = 'carpool_v2.operator_incentives';

  constructor(protected connection: PostgresConnection) {}

  public async register(data: InsertableCarpool, client?: PoolClient): Promise<WrittenCarpool> {
    const cl = client ?? (await this.connection.getClient().connect());
    if (!client) {
      await cl.query('BEGIN');
    }

    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        operator_id,
        operator_journey_id,
        operator_trip_id,
        operator_class,
        start_datetime,
        start_position,
        end_datetime,
        end_position,
        distance,
        licence_plate,
        driver_identity_key,
        driver_operator_user_id,
        driver_phone,
        driver_phone_trunc,
        driver_travelpass_name,
        driver_travelpass_user_id,
        driver_revenue,
        passenger_identity_key,
        passenger_operator_user_id,
        passenger_phone,
        passenger_phone_trunc,
        passenger_travelpass_name,
        passenger_travelpass_user_id,
        passenger_over_18,
        passenger_seats,
        passenger_contribution,
        passenger_payments
      ) VALUES(
        ${data.operator_id},
        ${data.operator_journey_id},
        ${data.operator_trip_id},
        ${data.operator_class},
        ${data.start_datetime},
        ST_SetSRID(ST_Point(${data.start_position.lon}, ${data.start_position.lat}), 4326),
        ${data.end_datetime},
        ST_SetSRID(ST_Point(${data.end_position.lon}, ${data.end_position.lat}), 4326),
        ${data.distance},
        ${data.licence_plate},
        ${data.driver_identity_key},
        ${data.driver_operator_user_id},
        ${data.driver_phone},
        ${data.driver_phone_trunc},
        ${data.driver_travelpass_name},
        ${data.driver_travelpass_user_id},
        ${data.driver_revenue},
        ${data.passenger_identity_key},
        ${data.passenger_operator_user_id},
        ${data.passenger_phone},
        ${data.passenger_phone_trunc},
        ${data.passenger_travelpass_name},
        ${data.passenger_travelpass_user_id},
        ${data.passenger_over_18},
        ${data.passenger_seats},
        ${data.passenger_contribution},
        ${JSON.stringify(data.passenger_payments)}
      )
      ON CONFLICT (operator_id, operator_journey_id) DO NOTHING
      RETURNING _id, created_at, updated_at
    `;
    try {
      const result = await cl.query<WrittenCarpool>(sqlQuery);
      const carpool = result.rows.pop();
      if (!carpool) {
        // New carpool hasn't been saved because there is a conflict
        // Select data to provide function consistency
        const selectResult = await cl.query<WrittenCarpool>(sql`
          SELECT _id, created_at, updated_at 
          FROM ${raw(this.table)}
          WHERE
            operator_id = ${data.operator_id} AND 
            operator_journey_id = ${data.operator_journey_id}
        `);
        const selectCarpool = selectResult.rows.pop();
        if (!selectCarpool) {
          throw new DatabaseException();
        }
        return selectCarpool;
      }
      await this.syncIncentives(carpool._id, data.incentives, cl);
      return carpool;
    } catch (e) {
      if (!client) {
        await cl.query('ROLLBACK');
      }
      throw e;
    } finally {
      if (!client) {
        cl.release();
      }
    }
  }

  public async update(
    operator_id: Id,
    operator_journey_id: Uuid,
    data: UpdatableCarpool,
    client?: PoolClient,
  ): Promise<WrittenCarpool> {
    const cl = client ?? (await this.connection.getClient().connect());
    const keys = Object.keys(data)
      .filter((key) => key in data && ['incentives'].indexOf(key) < 0)
      .map((key) => {
        if (['start_position', 'end_position'].indexOf(key) >= 0) {
          return sql`${raw(key)} = ST_SetSRID(ST_Point(${data[key].lon}, ${data[key].lat}), 4326)`;
        }
        if (key === 'passenger_payments') {
          return sql`${raw(key)} = ${JSON.stringify(data[key])}`;
        }
        return sql`${raw(key)} = ${data[key]}`;
      });

    if (!!!keys.length) {
      throw new Error('No data provided to be updated');
    }

    const sqlQuery = sql`
       UPDATE ${raw(this.table)}
       SET ${join(keys, ',')}
       WHERE
         operator_id = ${operator_id} AND
         operator_journey_id = ${operator_journey_id}
       RETURNING _id, created_at, updated_at
    `;

    if (!client) {
      await cl.query('BEGIN');
    }

    try {
      const result = await cl.query<WrittenCarpool>(sqlQuery);
      const carpool = result.rows.pop();
      if (!carpool) {
        throw new DatabaseException();
      }

      if (data.incentives) {
        await this.syncIncentives(carpool._id, data.incentives, cl);
      }

      return carpool;
    } catch (e) {
      if (!client) {
        await cl.query('ROLLBACK');
      }
      throw e;
    } finally {
      if (!client) {
        cl.release();
      }
    }
  }

  protected async syncIncentives(
    carpool_id: Id,
    incentives: Array<CarpoolIncentive>,
    client: PoolClient,
  ): Promise<void> {
    await client.query(sql`DELETE FROM ${raw(this.incentiveTable)} WHERE carpool_id = ${carpool_id}`);
    if (!incentives.length) {
      return;
    }
    const sqlQuery = sql`INSERT INTO ${raw(this.incentiveTable)} (carpool_id, idx, siret, amount) VALUES ${bulk(
      incentives.map((i) => [carpool_id, i.index, i.siret, i.amount]),
    )}`;
    await client.query(sqlQuery);
  }
}
