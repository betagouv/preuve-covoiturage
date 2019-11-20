import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  JourneyRepositoryProviderInterface,
  JourneyRepositoryProviderInterfaceResolver,
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
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface> {
    const { operator_id, application_id } = context;

    const query = {
      text: `
        INSERT INTO ${this.table}
        ( operator_id, application_id, journey_id, payload )
        VALUES ( $1, $2, $3, $4 )
        RETURNING *
      `,
      values: [operator_id, application_id || 'unknown', journey.journey_id, journey],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Failed to create journey (${journey.journey_id})`);
    }

    return this.castTypes(result.rows[0]);
  }

  async createMany(
    data: JourneyInterface[],
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface[]> {
    const insertPayload = [];

    for (const journey of data) {
      const { operator_id, application_id } = context;
      insertPayload.push({
        text: '($#, $#, $#, $#)',
        values: [operator_id, application_id || 'unkown', journey.journey_id, journey],
      });
    }
    const normalizedInsertPayload = insertPayload.reduce(
      (acc, current) => {
        acc.text.push(current.text);
        acc.values.push(...current.values);
        return acc;
      },
      {
        text: [],
        values: [],
      },
    );

    const query = {
      text: `
        INSERT INTO ${this.table} (
          operator_id,
          application_id,
          journey_id,
          payload
        ) VALUES ${normalizedInsertPayload.text.join(',')}
        RETURNING *
      `,
      values: normalizedInsertPayload.values,
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);

    return result.rows.map(this.castTypes);
  }

  private castTypes(row: any): any {
    return {
      ...row,
      operator_id: typeof row.operator_id === 'string' ? parseInt(row.operator_id, 10) : row.operator_id,
    };
  }
}
