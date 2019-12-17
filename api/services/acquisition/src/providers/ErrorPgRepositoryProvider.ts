import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  ErrorRepositoryProviderInterface,
  ErrorRepositoryProviderInterfaceResolver,
} from '../interfaces/ErrorRepositoryProviderInterface';
import { ParamsInterface as CreateInterface } from '../shared/acquisition/logerror.contract';

@provider({
  identifier: ErrorRepositoryProviderInterfaceResolver,
})
export class ErrorPgRepositoryProvider implements ErrorRepositoryProviderInterface {
  public readonly table = 'acquisition.errors';

  constructor(protected connection: PostgresConnection) {}

  async create(data: CreateInterface): Promise<{ _id: number; created_at: Date }> {
    const query = {
      text: `
        INSERT INTO ${this.table}
        ( operator_id, source, error_message, error_code, error_line, auth, headers, body )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
        RETURNING _id, created_at
      `,
      values: [
        data.operator_id,
        data.source,
        data.error_message,
        data.error_code,
        data.error_line,
        data.auth,
        data.headers,
        data.body,
      ],
    };

    const result = await this.connection.getClient().query(query);

    return result.rows[0];
  }
}
