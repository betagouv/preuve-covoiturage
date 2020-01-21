import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  TerritoryOperatorRepositoryProviderInterfaceResolver,
  TerritoryOperatorRepositoryProviderInterface,
} from '../interfaces/TerritoryOperatorRepositoryProviderInterface';

@provider({
  identifier: TerritoryOperatorRepositoryProviderInterfaceResolver,
})
export class TerritoryOperatorRepositoryProvider implements TerritoryOperatorRepositoryProviderInterface {
  public readonly table = 'territory.territory_operators';

  constructor(protected connection: PostgresConnection) {}

  async findByOperator(id: number): Promise<number[]> {
    const query = {
      text: `SELECT territory_id FROM ${this.table} WHERE operator_id = $1`,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map((item) => item.territory_id);
  }

  async findByTerritory(id: number): Promise<number[]> {
    const query = {
      text: `SELECT operator_id FROM ${this.table} WHERE territory_id = $1`,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows.map((item) => item.operator_id);
  }

  async updateByOperator(id: number, list: number[]): Promise<void> {
    const client = await this.connection.getClient().connect();
    await client.query('BEGIN');
    try {
      const deleteQuery = {
        text: `
          DELETE FROM ${this.table}
          WHERE operator_id = $1::int
          AND NOT (territory_id = ANY($2::int[]))
          RETURNING territory_id`,
        values: [id, list],
      };

      await client.query(deleteQuery);
      const insertQuery = {
        text: `
          INSERT INTO ${this.table}
          (operator_id, territory_id)
          SELECT $1::int as operator_id, territory_id
          FROM UNNEST ($2::int[]) as territory_id
          ON CONFLICT DO NOTHING`,
        values: [id, list], // Array(list.length).fill(id)
      };

      await client.query(insertQuery);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      await client.release();
      throw e;
    }

    await client.release();
  }
}
