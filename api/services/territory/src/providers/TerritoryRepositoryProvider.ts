import { provider, NotFoundException, KernelInterfaceResolver, ConflictException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  TerritoryRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterface,
  FindParamsInterface,
  FindResultInterface,
  ListResultInterface,
  ListParamsInterface,
  UpdateResultInterface,
  UpdateParamsInterface,
  PatchContactsResultInterface,
  PatchContactsParamsInterface,
  CreateResultInterface,
  CreateParamsInterface,
} from '../interfaces/TerritoryRepositoryProviderInterface';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async find(params: FindParamsInterface): Promise<FindResultInterface> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT * from ${this.table} WHERE _id = $1 AND is_deleted = false
      `,
      values: [params._id],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }

    return result.rows[0];
  }

  async hasDoubleSiretThenFail(siret: string, id = 0): Promise<void> {
    const query = {
      text: `SELECT * from ${this.table} WHERE siret = $1 AND _id != $2 `,
      values: [siret, id],
    };

    const rowCount = (await this.connection.getClient().query(query)).rowCount;
    if (rowCount !== 0) throw new ConflictException(`Double siret is not allowed for territory ${id}`);
  }

  async list(params: ListParamsInterface): Promise<ListResultInterface> {
    const { search, offset, limit } = { limit: 100, offset: 0, ...params };
    const values = [];
    const whereClauses: string[] = [];

    if (search) {
      values.push(search.toLowerCase());
      whereClauses.push(`LOWER(name) LIKE '%$${values.length}}%'`);
    }

    const client = this.connection.getClient();
    const countQuery = `SELECT count(*) as territory_count from ${this.table} ${
      whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : ''
    }`;

    const total = parseFloat((await client.query(countQuery)).rows[0].territory_count);

    values.push(limit);
    values.push(offset);
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE is_deleted = false ${whereClauses.length ? whereClauses.join(' AND ') : ''}
        ORDER BY name ASC
        LIMIT $${whereClauses.length + 1}
        OFFSET $${whereClauses.length + 2}
      `,
      values,
    };

    const result = await client.query(query);

    return { data: result.rows, meta: { pagination: { offset, limit, total } } };
  }

  async create(data: CreateParamsInterface): Promise<CreateResultInterface> {
    const fields = ['name', 'shortname', 'level', 'contacts', 'address', 'active', 'activable'];

    const values: any[] = [
      data.name,
      data.shortname || '',
      data.level,
      data.contacts || '{}',
      data.address || '{}',
      data.active,
      data.activable,
    ];

    if (data.company_id) {
      fields.push('company_id');
      values.push(data.company_id);
    }

    const query = {
      text: `
        INSERT INTO ${this.table} (${fields.join(',')})
        VALUES (${fields.map((data, ind) => `$${ind + 1}`).join(',')})
        RETURNING *
      `,
      values,
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    }

    const resultData = result.rows[0];

    if (data.insee !== undefined && data.insee.length > 0) {
      const query = {
        text: `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES ${data.insee
          .map((insee) => `($1,'insee',${insee})`)
          .join(',')}`,
        values: [resultData._id],
      };

      await this.connection.getClient().query(query);
    }

    return resultData;
  }

  async delete(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`territory not found (${id})`);
    }

    return;
  }

  async update(data: UpdateParamsInterface): Promise<UpdateResultInterface> {
    const fields = [
      'name',
      'shortname',
      'level',
      'contacts',
      'address',
      'active',
      'activable',
      // 'density',
      'company_id',
      'ui_status',
    ];

    const values: any[] = [
      data.name,
      data.shortname || '',
      data.level,
      data.contacts || '{}',
      data.address || '{}',
      data.active,
      data.activable,
      data.company_id ? data.company_id : null,
    ];

    const client = this.connection.getClient();

    const query = {
      text: `
        UPDATE ${this.table}
        SET ${fields.map((val, ind) => `${val} = $${ind + 1}`).join(',')}
        WHERE _id=${data._id}
      `,
      values,
    };

    const result = await client.query(query);
    const cleanInseeQuery = {
      text: `DELETE FROM territory.territory_codes WHERE territory_id = $1 AND type=$2`,
      values: [data._id, 'insee'],
    };

    await client.query(cleanInseeQuery);

    if (data.insee !== undefined && data.insee.length > 0) {
      const query = {
        text: `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES ${data.insee
          .map((insee) => `($1,'insee',${insee})`)
          .join(',')}`,
        values: [data._id],
      };

      await client.query(query);
    }

    if (result.rowCount !== 1) {
      throw new Error(`Unable to update territory (${JSON.stringify(data)})`);
    }

    return (
      await client.query({
        text: `SELECT * from ${this.table} WHERE _id = $1`,
        values: [data._id],
      })
    ).rows[0];
  }

  async patchContacts(params: PatchContactsParamsInterface): Promise<PatchContactsResultInterface> {
    const query = {
      text: `UPDATE ${this.table} set contacts = $2 WHERE _id = $1`,
      values: [params._id, JSON.stringify(params.patch)],
    };

    const client = this.connection.getClient();
    await client.query(query);

    const modifiedTerritoryRes = await client.query({
      text: `SELECT * FROM ${this.table} WHERE _id = $1`,
      values: [params._id],
    });

    return modifiedTerritoryRes.rows[0];
  }

  async getRelationCodes(params: { _id: number }): Promise<{ _id: number[] }> {
    const query = {
      text: `
        SELECT *
        FROM territory.get_descendants(ARRAY[$1]::int[]) as _id,
      `,
      values: [params._id],
    };

    const result = await this.connection.getClient().query(query);
    return {
      _id: result.rows[0]._id || [],
    };
  }
}
