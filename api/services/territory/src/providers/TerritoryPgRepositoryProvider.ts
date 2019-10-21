import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { TerritoryInterface } from '@pdc/provider-schema';

import {
  TerritoryRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterface,
} from '../interfaces/TerritoryRepositoryProviderInterface';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryPgRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = 'territory.territories';

  constructor(protected connection: PostgresConnection) {}

  async find(id: string): Promise<TerritoryInterface> {
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

    return result.rows[0];
  }

  async all(): Promise<TerritoryInterface[]> {
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

  async create(data: TerritoryInterface): Promise<TerritoryInterface> {
    // CAUTION, API CHANGES
    // do not handle :
    // - insee
    // - insee_main
    // - network_id
    // - geometry
    // see normalization service and clean up TerritoryInterface
    const query = {
      text: `
        INSERT INTO ${this.table} (
          siret,
          name,
          shortname,
          acronym,

          company,
          address,
          contacts,
          
          parent_id,
          cgu_accepted_at,
          cgu_accepted_by
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
          $10
        )
        RETURNING *
      `,
      values: [
        data.siret,
        data.name,
        data.shortname,
        data.acronym,
        data.company,
        data.address,
        data.contacts,
        data.parent_id,
        data.cgu.accepted_at,
        data.cgu.accepted_by,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
    }
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
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

  async patch(id: string, patch: { [k: string]: any }): Promise<TerritoryInterface> {
    const updatablefields = [
      'siret',
      'name',
      'shortname',
      'acronym',
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

  async findByInsee(insee: String): Promise<TerritoryInterface> {
    throw new Error('This is not implemented here'); // move to normalization service
  }

  async findByPosition(lon: Number, lat: Number): Promise<TerritoryInterface> {
    throw new Error('This is not implemented here'); // move to normalization servie
  }
}
