import { ConfigInterfaceResolver, NotFoundException, provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

import { CreateApplication } from "@/pdc/services/application/dto/CreateApplication.ts";
import { FindApplication } from "@/pdc/services/application/dto/FindApplication.ts";
import { ListApplication } from "@/pdc/services/application/dto/ListApplication.ts";
import { RevokeApplication } from "@/pdc/services/application/dto/RevokeApplication.ts";
import { ApplicationInterface } from "../interfaces/ApplicationInterface.ts";

@provider()
export class ApplicationPgRepositoryProvider {
  public readonly table = "application.applications";

  constructor(
    protected connection: PostgresConnection,
    protected config: ConfigInterfaceResolver,
  ) {}

  async list(
    { owner_id, owner_service }: ListApplication,
  ): Promise<ApplicationInterface[]> {
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

    return result.rows.map((a: any) => this.applyDefaultPermissions(a));
  }

  async find(
    { uuid, owner_id, owner_service }: FindApplication,
  ): Promise<ApplicationInterface> {
    const ownerParams = owner_id && typeof owner_id !== "string"
      ? {
        text: "AND owner_id = $3::int",
        values: [owner_id],
      }
      : {
        text: "",
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

  async create(
    { name, owner_id, owner_service, permissions }: CreateApplication,
  ): Promise<ApplicationInterface> {
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

  async revoke(
    { uuid, owner_id, owner_service }: RevokeApplication,
  ): Promise<void> {
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

  applyDefaultPermissions(
    application: ApplicationInterface,
  ): ApplicationInterface {
    return {
      ...application,
      permissions: this.config.get("permissions.application", []),
    };
  }
}
