import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import {
  JourneyRepositoryProviderInterface,
  JourneyRepositoryProviderInterfaceResolver,
} from '../interfaces/JourneyRepositoryProviderInterface';

@provider({
  identifier: JourneyRepositoryProviderInterfaceResolver,
})
export class JourneyPgRepositoryProvider implements JourneyRepositoryProviderInterface {
  public readonly table = 'acquisition.acquisitions';

  constructor(protected connection: PostgresConnection) {}

  async create(journey: JourneyInterface & { application_id: string }): Promise<JourneyInterface> {
    const { operator_id, application_id } = journey;

    const query = {
      text: `
        INSERT INTO ${this.table} (
          operator_id,
          application_id,
          journey_id,
          payload
        ) VALUES (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING _id, journey_id, created_at
      `,
      values: [operator_id, application_id ? application_id : 'unkown', journey.journey_id, journey],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error();
    }

    return result.rows[0];
  }

  async createMany(data: (JourneyInterface & { application_id: string })[]): Promise<JourneyInterface[]> {
    const insertPayload = [];

    for (const journey of data) {
      const { operator_id, application_id } = journey;
      insertPayload.push({
        text: '($#, $#, $#)',
        values: [operator_id, application_id ? application_id : 'unkown', journey.journey_id, journey],
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
        RETURNING _id, journey_id, created_at
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

    return result.rows;
  }
}
