import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  ErrorRepositoryProviderInterface,
  ErrorRepositoryProviderInterfaceResolver,
} from '../interfaces/ErrorRepositoryProviderInterface';
import { ParamsInterface as CreateInterface } from '../shared/acquisition/logerror.contract';
import { ParamsInterface as ResolveInterface } from '../shared/acquisition/resolveerror.contract';

@provider({
  identifier: ErrorRepositoryProviderInterfaceResolver,
})
export class ErrorPgRepositoryProvider implements ErrorRepositoryProviderInterface {
  public readonly table = 'acquisition.errors';

  constructor(protected connection: PostgresConnection) {}
  async resolve(data: ResolveInterface): Promise<number> {
    const query = {
      text: `
        UPDATE ${this.table} SET error_resolved = TRUE
        WHERE operator_id = $1 AND journey_id = $2 AND error_stage = $3
      `,
      values: [data.operator_id, data.journey_id, data.error_stage],
    };

    return await (await this.connection.getClient().query(query)).rows.length;
  }

  async create(data: CreateInterface): Promise<{ _id: number; created_at: Date }> {
    let attempt: number;
    if (data.error_attempt == undefined) {
      const query = {
        text: `
          SELECT error_attempt FROM ${this.table}
          WHERE operator_id = $1 AND journey_id = $2 AND error_stage = $3
        `,
        values: [data.operator_id, data.journey_id, data.error_stage],
      };

      const result = await this.connection.getClient().query(query);
      // console.log('result.rows[0].attempt : ', result.rows[0]);
      console.log('result.rowCount : ', [data.operator_id, data.journey_id, data.error_stage], result.rowCount);
      attempt = result.rowCount > 0 ? parseFloat(result.rows[0].error_attempt) + 1 : 1;
    } else {
      attempt = data.error_attempt;
    }

    const query = {
      text: `
        INSERT INTO ${this.table}
        ( operator_id, journey_id, source, error_message, error_code, error_line, auth, headers, body, error_stage, error_attempt, error_resolved )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 )
        RETURNING _id, created_at
      `,
      values: [
        data.operator_id,
        data.journey_id,
        data.source,
        data.error_message,
        data.error_code,
        data.error_line,
        data.auth,
        data.headers,
        data.body,
        data.error_stage,
        attempt,
        false,
      ],
    };

    const result = await this.connection.getClient().query(query);

    return result.rows[0];
  }
}
