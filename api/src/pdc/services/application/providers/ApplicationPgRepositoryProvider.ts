import { provider, NotFoundException, ConfigInterfaceResolver } from '/ilos/common/index.ts';
import { PostgresConnection } from '/ilos/connection-postgres/index.ts';

import { RepositoryInterface as ListInterface } from '/shared/application/list.contract.ts';
import { RepositoryInterface as FindInterface } from '/shared/application/find.contract.ts';
import { RepositoryInterface as CreateInterface } from '/shared/application/create.contract.ts';
import { RepositoryInterface as RevokeInterface } from '/shared/application/revoke.contract.ts';
import { ApplicationInterface } from '/shared/application/common/interfaces/ApplicationInterface.ts';
import {
  ApplicationRepositoryProviderInterface,
  ApplicationRepositoryProviderInterfaceResolver,
} from '../interfaces/ApplicationRepositoryProviderInterface.ts';

@provider({
  identifier: ApplicationRepositoryProviderInterfaceResolver,
})
export class ApplicationPgRepositoryProvider implements ApplicationRepositoryProviderInterface {
  public readonly table = 'application.applications';

  constructor(
    protected connection: PostgresConnection,
    protected config: ConfigInterfaceResolver,
  ) {}

  async list({ owner_id, owner_service }: ListInterface): Promise<ApplicationInterface[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE owner_service = $1
        AND owner_id = $2::int
        AND deleted_at IS NULL
      `,
      values: [owner_service, owner_id],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (!result.rowCount) return [];

    return result.rows.map((a) => this.applyDefaultPermissions(a));
  }

  async find({ uuid, owner_id, owner_service }: FindInterface): Promise<ApplicationInterface> {
    const ownerParams =
      owner_id && typeof owner_id !== 'string'
        ? {
            text: 'AND owner_id = $3::int',
            values: [owner_id],
          }
        : {
            text: '',
            values: [],
          };

    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE owner_service = $1
        ${ownerParams.text}
        AND uuid = $2
        AND deleted_at IS NULL
        LIMIT 1
      `,
      values: [owner_service, uuid, ...ownerParams.values],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      throw new Error(`Application not found (${uuid})`);
    }

    return this.applyDefaultPermissions(result.rows[0]);
  }

  async create({ name, owner_id, owner_service, permissions }: CreateInterface): Promise<ApplicationInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          name, owner_id, owner_service, permissions
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *
      `,
      values: [name, owner_id, owner_service, permissions],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to create application (${name})`);
    }

    return this.applyDefaultPermissions(result.rows[0]);
  }

  async revoke({ uuid, owner_id, owner_service }: RevokeInterface): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE owner_service = $1
        AND owner_id = $2::int
        AND uuid = $3
        AND deleted_at IS NULL
      `,
      values: [owner_service, owner_id, uuid],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`Revoking application failed (${uuid})`);
    }
  }

  applyDefaultPermissions(application: ApplicationInterface): ApplicationInterface {
    return {
      ...application,
      permissions: this.config.get('permissions.application', []),
    };
  }
}
