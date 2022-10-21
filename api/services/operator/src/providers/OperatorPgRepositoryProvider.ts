import { provider, NotFoundException, KernelInterfaceResolver } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';

import { OperatorInterface } from '../shared/operator/common/interfaces/OperatorInterface';
import { OperatorDbInterface } from '../shared/operator/common/interfaces/OperatorDbInterface';
import { OperatorListInterface } from '../shared/operator/common/interfaces/OperatorListInterface';
import {
  OperatorRepositoryProviderInterface,
  OperatorRepositoryProviderInterfaceResolver,
} from '../interfaces/OperatorRepositoryProviderInterface';

import {
  signature as companyFindSignature,
  ParamsInterface as CompanyParamsInterface,
  ResultInterface as CompanyResultInterface,
} from '../shared/company/find.contract';
import { signature as companyFetchSignature } from '../shared/company/fetch.contract';

@provider({
  identifier: OperatorRepositoryProviderInterfaceResolver,
})
export class OperatorPgRepositoryProvider implements OperatorRepositoryProviderInterface {
  public readonly table = 'operator.operators';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async find(id: number, withThumbnail = false): Promise<OperatorDbInterface> {
    const selectThumbnail = withThumbnail ? ", encode(ot.data, 'hex')::text AS thumbnail" : '';
    const joinThumbnail = withThumbnail ? ' LEFT JOIN operator.thumbnails ot ON oo._id = ot.operator_id' : '';

    const query = {
      text: `
        SELECT oo.* ${selectThumbnail} FROM ${this.table} oo
        ${joinThumbnail}
        WHERE oo._id = $1
        AND deleted_at IS NULL
        LIMIT 1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    const operator = result.rows[0];
    if (operator.siret) {
      operator.company = await this.kernel.call<CompanyParamsInterface, CompanyResultInterface>(
        companyFindSignature,
        { query: { siret: operator.siret } },
        { channel: { service: 'operator' }, call: { user: { permissions: ['common.company.find'] } } },
      );
    }

    if (withThumbnail && operator.thumbnail) {
      operator.thumbnail = this.hexToB64(operator.thumbnail);
    }

    return operator;
  }

  async quickFind(_id: number, withThumbnail = false): Promise<{ uuid: string; name: string; thumbnail?: string }> {
    const selectThumbnail = withThumbnail ? ", encode(ot.data, 'hex')::text AS thumbnail" : '';
    const joinThumbnail = withThumbnail ? ' LEFT JOIN operator.thumbnails ot ON oo._id = ot.operator_id' : '';

    const result = await this.connection.getClient().query({
      text: `
        SELECT uuid, name ${selectThumbnail} FROM ${this.table} oo
        ${joinThumbnail}
        WHERE oo._id = $1
        AND oo.deleted_at IS NULL
        LIMIT 1
      `,
      values: [_id],
    });

    if (!result.rowCount) throw new NotFoundException(`Operator with _id (${_id}) not found`);

    const operator = result.rows[0];

    if (withThumbnail && operator.thumbnail) {
      operator.thumbnail = this.hexToB64(operator.thumbnail);
    }

    return operator;
  }

  async all(): Promise<OperatorListInterface[]> {
    const query = {
      text: `
        SELECT
          _id,
          uuid,
          name,
          legal_name,
          siret,
          company,
          address,
          cgu_accepted_at,
          cgu_accepted_by,
          created_at,
          updated_at
        FROM ${this.table}
        WHERE deleted_at IS NULL
      `,
      values: [],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  async create(data: OperatorInterface): Promise<OperatorDbInterface> {
    if (data.siret) {
      await this.kernel.call(companyFetchSignature, data.siret, {
        channel: { service: 'operator' },
        call: { user: { permissions: ['common.company.fetch'] } },
      });
    }

    const connection = await this.connection.getClient().connect();
    connection.query('BEGIN');
    try {
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
          data.name,
          data.legal_name,
          data.siret,
          data.company || '{}',
          data.address || '{}',
          data.bank || '{}',
          data.contacts || '{}',
        ],
      };

      // store the operator
      const result = await connection.query(query);

      if (result.rowCount !== 1) {
        throw new Error(`Unable to create operator (${JSON.stringify(data)})`);
      }

      // store the thumbnail
      if (data?.thumbnail?.length) {
        await this.insertThumbnail(connection, result.rows[0]._id, data.thumbnail);
      }

      await connection.query('COMMIT');

      return result.rows[0];
    } catch (e) {
      await connection.query('ROLLBACK');
      throw e;
    } finally {
      connection.release();
    }
  }

  /**
   * Soft delete the operator.
   * A real delete will remove the operator.thumbnails entries too
   */
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
  async update(data: OperatorDbInterface): Promise<OperatorDbInterface> {
    const { _id, ...patch } = data;

    return this.patch(_id, {
      company: '{}',
      address: '{}',
      contacts: '{}',
      cgu_accepted_at: null,
      cgu_accepted_by: null,
      ...patch,
    });
  }

  async patch(id: number, patch: { [k: string]: any }): Promise<OperatorDbInterface> {
    if (patch.siret) {
      await this.kernel.call(companyFetchSignature, patch.siret, {
        channel: { service: 'operator' },
        call: { user: { permissions: ['common.company.fetch'] } },
      });
    }
    const connection = await this.connection.getClient().connect();
    await connection.query('BEGIN');

    try {
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

      const result = await connection.query(query);

      if (result.rowCount !== 1) {
        throw new NotFoundException(`operator not found (${id})`);
      }

      // store or remove the thumbnail
      // if prop is missing, do nothing
      if ('thumbnail' in patch) {
        if (patch.thumbnail && patch.thumbnail.length) {
          await this.insertThumbnail(connection, id, patch.thumbnail);
        } else if (patch.thumbnail === null) {
          await this.removeThumbnail(connection, id);
        }
      }

      await connection.query('COMMIT');

      return result.rows[0];
    } catch (e) {
      await connection.query('ROLLBACK');
      throw e;
    } finally {
      connection.release();
    }
  }

  public async patchThumbnail(operator_id: number, base64Thumbnail: string): Promise<void> {
    const connection = await this.connection.getClient().connect();
    await connection.query('BEGIN');
    try {
      if (base64Thumbnail && base64Thumbnail.length) {
        await this.insertThumbnail(connection, operator_id, base64Thumbnail);
      } else if (base64Thumbnail === null) {
        await this.removeThumbnail(connection, operator_id);
      }
      await connection.query('COMMIT');
    } catch (e) {
      await connection.query('ROLLBACK');
      throw e;
    } finally {
      connection.release();
    }
  }

  private async insertThumbnail(connection: PoolClient, operator_id: number, base64Thumbnail: string): Promise<void> {
    // cleanup
    await this.removeThumbnail(connection, operator_id);
    // insert
    await connection.query({
      text: `INSERT INTO operator.thumbnails ( operator_id, data ) VALUES ( $1, decode($2, 'hex'))`,
      values: [operator_id, this.b64ToHex(base64Thumbnail)],
    });
  }

  private async removeThumbnail(connection: PoolClient, operator_id: number): Promise<void> {
    await connection.query({
      text: 'DELETE FROM operator.thumbnails WHERE operator_id = $1',
      values: [operator_id],
    });
  }

  private b64ToHex(b64: string): string {
    return Buffer.from(b64, 'base64').toString('hex');
  }

  private hexToB64(hex: string): string {
    return Buffer.from(hex, 'hex').toString('base64');
  }
}
