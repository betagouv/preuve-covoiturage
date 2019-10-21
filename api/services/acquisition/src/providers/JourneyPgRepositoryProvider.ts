import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';
import { JourneyInterface } from '@pdc/provider-schema';
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
  async createMany(data: JourneyInterface[]): Promise<JourneyInterface[]> {
    const insertPayload = [];

    for (const journey of data) {
      const { operator_id, application_id } = journey;
      insertPayload.push({
        text: '($#, $#, $#)',
        values: [operator_id, application_id ? application_id : 'unkown', journey],
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
          application_id,
          operator_id,
          payload
        ) VALUES ${normalizedInsertPayload.text.join(',')}
        RETURNING _id
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
