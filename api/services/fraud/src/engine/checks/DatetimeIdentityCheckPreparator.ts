import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PrepareCheckInterface } from '../../interfaces';
import { DatetimeIdentityCheckParamsInterface } from './datetimeIdentity/DatetimeIdentityCheckParamsInterface';

@provider()
export class DatetimeIdentityCheckPreparator implements PrepareCheckInterface<DatetimeIdentityCheckParamsInterface> {
  constructor(private connection: PostgresConnection) {}

  async prepare(acquisitionId: number): Promise<DatetimeIdentityCheckParamsInterface[]> {
    const query = {
      text: `
        WITH input AS (
          SELECT
            cc.duration,
            cc.datetime as start_datetime,
            (cc.datetime + (cc.duration || ' seconds')::interval) as end_datetime,
            id.uuid as passenger_uuid,
            cc.acquisition_id
          FROM carpool.carpools AS cc
          JOIN carpool.identities AS id
            ON cc.identity_id = id._id
          WHERE
            cc.acquisition_id = $1::int
            AND cc.is_driver = false
          LIMIT 1
        ),
        data AS (
          SELECT
            i.duration,
            EXTRACT(EPOCH FROM (cc.datetime - i.start_datetime)::interval) as start_interval,
            EXTRACT(EPOCH FROM (
              (cc.datetime + (cc.duration || ' seconds')::interval
            ) - i.end_datetime)::interval) as end_interval
          FROM carpool.carpools as cc
          JOIN carpool.identities as id
            ON cc.identity_id = id._id
          JOIN input as i
            ON (
              cc.datetime::date = i.start_datetime::date
              OR cc.datetime::date = i.end_datetime::date
            ) AND id.uuid = i.passenger_uuid
            AND cc.acquisition_id <> i.acquisition_id
        )
        SELECT
          (
            CASE 
              WHEN (
                (start_interval::int >= 0 AND end_interval::int <= 0)
                OR (start_interval::int >= 0 AND @start_interval <= duration)
                OR (end_interval::int <= 0 AND @end_interval <= duration)
              ) THEN true
              ELSE false
              END
          ) as inside,
          LEAST(@start_interval::int, @end_interval::int) as interval
        FROM data
      `,
      values: [acquisitionId],
    };

    const dbResult = await this.connection.getClient().query(query);
    return [dbResult.rows];
  }
}
