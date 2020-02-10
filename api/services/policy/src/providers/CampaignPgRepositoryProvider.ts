import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import {
  CampaignRepositoryProviderInterface,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces/CampaignRepositoryProviderInterface';

@provider({
  identifier: CampaignRepositoryProviderInterfaceResolver,
})
export class CampaignPgRepositoryProvider implements CampaignRepositoryProviderInterface {
  public readonly table = 'policy.policies';

  constructor(protected connection: PostgresConnection) {}

  async find(id: number): Promise<CampaignInterface> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE _id = $1
        AND deleted_at IS NULL
        LIMIT 1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return this.castTypes(result.rows[0]);
  }

  // TODO interface
  async create(data: CampaignInterface & { start_date: Date; end_date: Date }): Promise<any> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          parent_id,
          territory_id,
          start_date,
          end_date,
          name,
          description,
          unit,
          status,
          global_rules,
          rules,
          ui_status
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
        RETURNING *
      `,
      values: [
        'parent_id' in data ? data.parent_id : null,
        data.territory_id,
        data.start_date,
        data.end_date,
        data.name,
        'description' in data ? data.description : null,
        data.unit,
        data.status,
        JSON.stringify(data.global_rules),
        JSON.stringify(data.rules),
        JSON.stringify('ui_status' in data ? data.ui_status : {}),
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create campaign (${JSON.stringify(data)})`);
    }

    return this.castTypes(result.rows[0]);
  }

  async patch(id: number, patch: Partial<CampaignInterface>): Promise<CampaignInterface> {
    const updatablefields = [
      'ui_status',
      'name',
      'description',
      'start_date',
      'end_date',
      'unit',
      'global_rules',
      'rules',
      'status',
    ].filter((k) => Object.keys(patch).indexOf(k) >= 0);

    const sets = {
      text: ['updated_at = NOW()'],
      values: [],
    };

    for (const fieldName of updatablefields) {
      sets.text.push(`${fieldName} = $#`);
      sets.values.push(
        ['global_rules', 'rules'].indexOf(fieldName) >= 0 ? JSON.stringify(patch[fieldName]) : patch[fieldName],
      );
    }

    const query = {
      text: `
      UPDATE ${this.table}
        SET ${sets.text.join(',')}
        WHERE _id = $#
        AND deleted_at IS NULL
        RETURNING *
      `,
      values: [...sets.values, id],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException(`campaign not found (${id})`);
    }

    return this.castTypes(result.rows[0]);
  }

  async deleteDraftOrTemplate(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1 AND status::text = ANY ($2::text[]) AND deleted_at IS NULL
      `,
      values: [id, ['draft', 'template']],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`Campaign not found (${id})`);
    }

    return;
  }

  async patchWhereTerritory(
    id: number,
    territoryId: number,
    patch: Partial<CampaignInterface>,
  ): Promise<CampaignInterface> {
    const updatablefields = [
      'ui_status',
      'name',
      'description',
      'start_date',
      'end_date',
      'unit',
      'global_rules',
      'rules',
    ].filter((k) => Object.keys(patch).indexOf(k) >= 0);

    const sets = {
      text: ['updated_at = NOW()'],
      values: [],
    };

    for (const fieldName of updatablefields) {
      sets.text.push(`${fieldName} = $#`);
      sets.values.push(
        ['global_rules', 'rules'].indexOf(fieldName) >= 0 ? JSON.stringify(patch[fieldName]) : patch[fieldName],
      );
    }

    const query = {
      text: `
      UPDATE ${this.table}
        SET ${sets.text.join(',')}
        WHERE _id = $#
        AND territory_id = $#
        AND deleted_at IS NULL
        RETURNING *
      `,
      values: [...sets.values, id, territoryId],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException(`campaign not found (${id})`);
    }

    return this.castTypes(result.rows[0]);
  }

  async findOneWhereTerritory(id: number, territoryId: number): Promise<CampaignInterface> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE _id = $1
        AND territory_id = $2
        AND deleted_at IS NULL
        LIMIT 1
      `,
      values: [id, territoryId],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return this.castTypes(result.rows[0]);
  }

  async findWhere(search: { territory_id?: number | null; status?: string }): Promise<CampaignInterface[]> {
    const values = [];
    let where = '';

    if ('territory_id' in search && 'status' in search) {
      where = `AND status::text = $1 AND territory_id ${search.territory_id === null ? 'IS NULL' : '= $2::text'}`;
      values.push(search.status);
      if (search.territory_id !== null) {
        values.push(search.territory_id);
      }
    } else if ('territory_id' in search) {
      where = `AND territory_id ${search.territory_id === null ? 'IS NULL' : '= $1::text'}`;
      if (search.territory_id !== null) {
        values.push(search.territory_id);
      }
    } else if ('status' in search) {
      where = 'AND status::text = $1';
      values.push(search.status);
    }

    const query = {
      values,
      text: `
        SELECT * FROM ${this.table}
        WHERE deleted_at IS NULL
        ${where}
      `,
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map(this.castTypes);
  }

  async findApplicableCampaigns(territories: number[], date: Date): Promise<any[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE territory_id = ANY($1::text[])
        AND start_date <= $2
        AND end_date >= $2
        AND status = $3
        AND deleted_at IS NULL
      `,
      values: [territories, date, 'active'],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map(this.castTypes);
  }

  async getTemplates(): Promise<CampaignInterface[]> {
    const result = await this.connection.getClient().query(`
      SELECT * FROM ${this.table} WHERE status = 'template' AND deleted_at IS NULL
    `);

    return result.rows;
  }

  private castTypes(row: any): any {
    return {
      ...row,
      territory_id: typeof row.territory_id === 'string' ? parseInt(row.territory_id, 10) : row.territory_id,
    };
  }
}
