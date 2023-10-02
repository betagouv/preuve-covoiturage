import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import sql, { join, raw } from 'sql-template-tag';
import { Id, InsertableCarpool, UpdatableCarpool, Uuid, WritenCarpool } from '../interfaces';

@provider()
export class CarpoolRepository {
  readonly table = 'carpool_v2.carpools';

  constructor(protected connection: PostgresConnection) {}

  public async register(data: InsertableCarpool, client?: PoolClient): Promise<WritenCarpool> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} VALUES (
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
        driver_firstname,
        driver_lastname,
        driver_email,
        driver_company,
        driver_travelpass_name,
        driver_travelpass_user_id,
        driver_revenue,
        passenger_identity_key,
        passenger_operator_user_id,
        passenger_phone,
        passenger_phone_trunc,
        passenger_firstname,
        passenger_lastname,
        passenger_email,
        passenger_company,
        passenger_travelpass_name,
        passenger_travelpass_user_id,
        passenger_over_18,
        passenger_seats,
        passenger_contribution,
        passenger_payments
      ) VALUES (
        ${data.operator_id},
        ${data.operator_journey_id},
        ${data.operator_trip_id},
        ${data.operator_class},
        ${data.start_datetime},
        ${data.start_position},
        ${data.end_datetime},
        ${data.end_position},
        ${data.distance},
        ${data.licence_plate},
        ${data.driver_identity_key},
        ${data.driver_operator_user_id},
        ${data.driver_phone},
        ${data.driver_phone_trunc},
        ${data.driver_firstname},
        ${data.driver_lastname},
        ${data.driver_email},
        ${data.driver_company},
        ${data.driver_travelpass_name},
        ${data.driver_travelpass_user_id},
        ${data.driver_revenue},
        ${data.passenger_identity_key},
        ${data.passenger_operator_user_id},
        ${data.passenger_phone},
        ${data.passenger_phone_trunc},
        ${data.passenger_firstname},
        ${data.passenger_lastname},
        ${data.passenger_email},
        ${data.passenger_company},
        ${data.passenger_travelpass_name},
        ${data.passenger_travelpass_user_id},
        ${data.passenger_over_18},
        ${data.passenger_seats},
        ${data.passenger_contribution},
        ${data.passenger_payments}
      ) RETURNING _id, created_at, updated_at
    `;
    const result = await cl.query<WritenCarpool>(sqlQuery);
    return result.rows.pop();
  }

  public async update(
    operator_id: Id,
    operator_journey_id: Uuid,
    data: UpdatableCarpool,
    client?: PoolClient,
  ): Promise<WritenCarpool> {
    const cl = client ?? this.connection.getClient();
    const keys = Object.keys(data)
      .filter(key => key in data)
      .map(key => sql`${raw(key)} = ${data[key]}`);

    if (!!keys.length) {
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
    const result = await cl.query<WritenCarpool>(sqlQuery);
    return result.rows.pop();
  }
}
