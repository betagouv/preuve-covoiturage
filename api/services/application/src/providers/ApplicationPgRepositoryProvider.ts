import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';
import {
  ApplicationRepositoryProviderInterface,
  ApplicationRepositoryProviderInterfaceResolver,
} from '../interfaces/ApplicationRepositoryProviderInterface';

@provider({
  identifier: ApplicationRepositoryProviderInterfaceResolver,
})
export class ApplicationPgRepositoryProvider implements ApplicationRepositoryProviderInterface {
  public readonly table = 'operator.operators';

  constructor(protected connection: PostgresConnection) {}

  async find(_id: string): Promise<ApplicationInterface> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE _id = $1
        LIMIT 1
      `,
      values: [_id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Application not found (${_id})`);
    }

    return result.rows[0];
  }

  async delete(_id: string): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1
      `,
      values: [_id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Deleting application failed (${_id})`);
    }
  }

  async createForOperator(name: string, operator_id: string): Promise<ApplicationInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          name, owner_id, owner_service, permissions
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *
      `,
      values: [name, operator_id, 'operator', ['journey.create']],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to create application (${name})`);
    }

    return result.rows[0];
  }

  async allByOperator(operator_id: string): Promise<ApplicationInterface[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE owner_id = $1 AND owner_service = $2
        AND deleted_at IS NULL
      `,
      values: [operator_id, 'operator'],
    };

    const result = await this.connection.getClient().query(query);

    if (!result.rowCount) return [];

    return result.rows;
  }
}
