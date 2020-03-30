import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  JourneyRepositoryProviderInterface,
  JourneyRepositoryProviderInterfaceResolver,
} from '../interfaces/JourneyRepositoryProviderInterface';
import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { ParamsFindInterface } from '../shared/acquisition/common/interfaces/ParamsFindInterface';
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
  ): Promise<AcquisitionInterface> {
    const { operator_id, application_id } = context;

    const query = {
      text: `
        INSERT INTO ${this.table}
        ( operator_id, application_id, journey_id, payload )
        VALUES ( $1, $2, $3, $4 )
        RETURNING *
      `,
      values: [operator_id, application_id || 0, journey.journey_id, journey],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Failed to create journey (${journey.journey_id})`);
    }

    return result.rows[0];
  }

  async exists(journey_id: string, operator_id: number, application_id: number): Promise<number> {
    const query = {
      text: `
        SELECT
          _id
        FROM ${this.table}
        WHERE operator_id = $1::int
        AND journey_id = $2::varchar
        AND application_id = $3::int
        LIMIT 1`,
      values: [operator_id, journey_id, application_id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException();
    }

    return result.rows[0]._id;
  }

  async find(params: ParamsFindInterface): Promise<AcquisitionInterface> {
    const { journey_id, operator_id } = params;

    const values = operator_id ? [journey_id, operator_id] : [journey_id];
    const whereOperator = operator_id ? ' AND operator_id = $2' : '';

    const results = await this.connection.getClient().query({
      values,
      text: `
        SELECT * FROM ${this.table}
        WHERE journey_id = $1${whereOperator}
        LIMIT 1
      `,
    });

    if (!results.rowCount) {
      throw new NotFoundException(
        `[acquisition.journeys:find] journey_id not found (${journey_id}) for operator (${operator_id})`,
      );
    }

    return results.rows[0];
  }
}
