import { provider, NotFoundException, KernelInterfaceResolver, ConflictException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TerritoryInterface } from '../shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryDbInterface } from '../shared/territory/common/interfaces/TerritoryDbInterface';
import {
  TerritoryRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterface,
} from '../interfaces/TerritoryRepositoryProviderInterface';

import { signature as companyFindSignature } from '../shared/company/find.contract';
import { signature as companyFetchSignature } from '../shared/company/fetch.contract';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryPgRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async find(id: number): Promise<TerritoryDbInterface> {
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
    const territory = result.rows[0];
    if (territory.siret) {
      territory.company = await this.kernel.call(
        companyFindSignature,
        { siret: territory.siret },
        { channel: { service: 'operator' }, call: { user: { permissions: ['company.find'] } } },
      );
    }

    return territory;
  }

  async hasDoubleSiretThenFail(siret: string, id = 0): Promise<void> {
    const query = {
      text: `SELECT * from ${this.table} WHERE siret = $1 AND _id != $2 `,
      values: [siret, id],
    };

    const rowCount = (await this.connection.getClient().query(query)).rowCount;
    console.log('rowCount : ', rowCount);
    if (rowCount !== 0) throw new ConflictException('Double siret is not allowed for territory ' + id);
  }

  async all(): Promise<TerritoryDbInterface[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE deleted_at IS NULL
      `,
      values: [],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  async create(data: TerritoryInterface): Promise<TerritoryDbInterface> {
    await this.hasDoubleSiretThenFail(data.siret);

    const query = {
      text: `
        INSERT INTO ${this.table}
        (
          siret,
          name,
          shortname,

          company,
          address,
          contacts,

          parent_id,
          cgu_accepted_at,
          cgu_accepted_by
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
        RETURNING *
      `,
      values: [
        data.siret,
        data.name,
        data.shortname || '',
        data.company || '{}',
        data.address || '{}',
        data.contacts || '{}',
        data.parent_id,
        data.cgu_accepted_at,
        data.cgu_accepted_by,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    }

    if (data.siret) {
      await this.kernel.notify(companyFetchSignature, data.siret, {
        channel: { service: 'operator' },
        call: { user: { permissions: ['company.fetch'] } },
      });
    }

    return result.rows[0];
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
      throw new NotFoundException(`operator not found (${id})`);
    }

    return;
  }

  // TODO
  async update(data: TerritoryDbInterface): Promise<TerritoryDbInterface> {
    const { _id, ...patch } = data;
    await this.hasDoubleSiretThenFail(data.siret, _id);

    if (data.siret) {
      await this.kernel.notify(companyFetchSignature, data.siret, {
        channel: { service: 'operator' },
        call: { user: { permissions: ['company.fetch'] } },
      });
    }

    return this.patch(_id, {
      parent_id: null,
      shortname: null,
      company: '{}',
      address: '{}',
      contact: '{}',
      cgu_accepted_at: null,
      cgu_accepted_by: null,
      ...patch,
    });
  }

  async patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbInterface> {
    const updatablefields = [
      'siret',
      'name',
      'shortname',
      'company',
      'address',
      'contacts',
      'parent_id',
      'cgu_accepted_at',
      'cgu_accepted_by',
    ].filter((k) => Object.keys(patch).indexOf(k) >= 0);

    const sets = {
      text: ['updated_at = NOW()'],
      values: [],
    };

    for (const fieldName of updatablefields) {
      sets.text.push(`${fieldName} = $#`);
      sets.values.push(patch[fieldName]);
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
      throw new NotFoundException(`territory not found (${id})`);
    }

    return result.rows[0];
  }

  async findByInsee(insee: string): Promise<TerritoryDbInterface> {
    throw new Error('This is not implemented here'); // move to normalization service
  }

  async findByPosition(lon: number, lat: number): Promise<TerritoryDbInterface> {
    throw new Error('This is not implemented here'); // move to normalization servie
  }
}
