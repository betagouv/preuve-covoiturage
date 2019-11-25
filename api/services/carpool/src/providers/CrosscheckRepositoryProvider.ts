import { provider } from '@ilos/common';
import v4 from 'uuid/v4';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CrosscheckRepositoryProviderInterface,
  CrosscheckRepositoryProviderInterfaceResolver,
} from '../interfaces/CrosscheckRepositoryProviderInterface';

import { PositionInterface } from '../interfaces/Carpool';

/*
 * Trip specific repository
 */
@provider({
  identifier: CrosscheckRepositoryProviderInterfaceResolver,
})
export class CrosscheckRepositoryProvider implements CrosscheckRepositoryProviderInterface {
  public readonly table = 'carpool.carpools';
  public readonly identityTable = 'carpool.identities';

  constructor(public connection: PostgresConnection) {}

  public async getTripId(data: {
    operator_trip_id?: string;
    datetime: Date;
    start: PositionInterface;
    end: PositionInterface;
    identity_uuid: string;
  }): Promise<string> {
    let tripId: string;

    if (data.operator_trip_id) {
      tripId = await this.findTripIdByOperatorTripId(data.operator_trip_id);
    }

    if (!tripId && data.identity_uuid && data.datetime) {
      tripId = await this.findTripIdByIdentityAndDate(data.identity_uuid, data.datetime);
    }

    return tripId || v4();
  }

  protected async findTripIdByOperatorTripId(operator_trip_id: string): Promise<string | null> {
    const query = {
      text: `
        SELECT trip_id as _id FROM ${this.table}
        WHERE operator_trip_id = $1::varchar
        LIMIT 1
      `,
      values: [operator_trip_id],
    };
    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0]._id;
  }

  protected async findTripIdByIdentityAndDate(identity_uuid: string, start: Date): Promise<string | null> {
    const startDateString = start.toISOString ? start.toISOString() : new Date(start).toISOString();

    const query = {
      text: `
        SELECT carpool.trip_id as _id FROM ${this.table} as carpool
          JOIN ${this.identityTable} as identity
          ON carpool.identity_id = identity._id
          WHERE identity.uuid = $1
          AND carpool.datetime >= timestamptz '${startDateString}'::timestamptz - interval '2 hour'
          AND carpool.datetime <= timestamptz '${startDateString}'::timestamptz + interval '2 hour'
          LIMIT 1
      `,
      values: [identity_uuid],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0]._id;
  }
}
