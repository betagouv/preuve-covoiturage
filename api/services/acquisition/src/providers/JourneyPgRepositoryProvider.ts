import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  JourneyRepositoryProviderInterface,
  JourneyRepositoryProviderInterfaceResolver,
  ExistsResultInterface,
} from '../interfaces/JourneyRepositoryProviderInterface';
import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

@provider({
  identifier: JourneyRepositoryProviderInterfaceResolver,
})
export class JourneyPgRepositoryProvider implements JourneyRepositoryProviderInterface {
  public readonly table = 'acquisition.acquisitions';

  constructor(protected connection: PostgresConnection) {}

  async create(
    journey: JourneyInterface,
    context: { operator_id: number; application_id: number },
    apiVersion: number = 2,
  ): Promise<AcquisitionInterface> {
    const { operator_id, application_id } = context;

    const query = {
      text: `
        INSERT INTO ${this.table}
        ( operator_id, application_id, journey_id, payload, api_version )
        VALUES ( $1, $2, $3, $4, $5 )
        RETURNING *
      `,
      values: [operator_id, application_id || 0, journey.journey_id, journey, apiVersion],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Failed to create journey (${journey.journey_id})`);
    }

    return result.rows[0];
  }

  async exists(journey_id: string, operator_id: number): Promise<ExistsResultInterface | undefined> {
    const query = {
      text: `
        SELECT
          _id,
          created_at
        FROM ${this.table}
        WHERE operator_id = $1::int
        AND journey_id = $2::varchar
        LIMIT 1`,
      values: [operator_id, journey_id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      return undefined;
    }

    return result.rows[0];
  }
}
