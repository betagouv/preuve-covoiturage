import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { OperatorInterface } from '../shared/operator/common/interfaces/OperatorInterface';
import {
  OperatorRepositoryProviderInterface,
  OperatorRepositoryProviderInterfaceResolver,
} from '../interfaces/OperatorRepositoryProviderInterface';

@provider({
  identifier: OperatorRepositoryProviderInterfaceResolver,
})
export class OperatorPgRepositoryProvider implements OperatorRepositoryProviderInterface {
  public readonly table = 'operator.operators';

  constructor(protected connection: PostgresConnection) {}

  async find(id: string): Promise<OperatorInterface> {
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

  async all(): Promise<OperatorInterface[]> {
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

  async create(data: OperatorInterface & { siret: string }): Promise<OperatorInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          name,
          legal_name,
          siret,
          company,
          address,
          bank,
          contacts
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING *
      `,
      values: [
        data.nom_commercial,
        data.raison_sociale,
        data.siret,
        data.company,
        data.address,
        data.bank,
        data.contacts,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create operator (${JSON.stringify(data)})`);
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

  // TODO
  async update(params: OperatorInterface): Promise<OperatorInterface> {
    throw new Error('Not implemented');
  }

  async patch(id: string, patch: { [k: string]: any }): Promise<OperatorInterface> {
    const updatablefields = [
      'name',
      'legal_name',
      'siret',
      'company',
      'address',
      'bank',
      'contacts',
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
      throw new NotFoundException(`operator not found (${id})`);
    }

    return result.rows[0];
  }
}
