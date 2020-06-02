import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

export interface JourneyRepositoryProviderInterface {
  acquiredJourneys(fromDays?: number): Promise<number>;
  acquiredFailedJourneys(fromDays?: number): Promise<number>;
  allCarpools(fromDays?: number): Promise<number>;
  missingCarpools(fromDays?: number): Promise<number>;
  missingCarpoolsByDate(fromDays?: number): Promise<{ date: Date; count: number }[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  abstract acquiredJourneys(fromDays?: number): Promise<number>;
  abstract acquiredFailedJourneys(fromDays?: number): Promise<number>;
  abstract allCarpools(fromDays?: number): Promise<number>;
  abstract missingCarpools(fromDays?: number): Promise<number>;
  abstract missingCarpoolsByDate(fromDays?: number): Promise<{ date: Date; count: number }[]>;
}

@provider({ identifier: JourneyRepositoryProviderInterfaceResolver })
export class JourneyRepositoryProvider implements JourneyRepositoryProviderInterface {
  constructor(private pg: PostgresConnection) {}

  buildWhereClause(dateField: string, fromDays: number): string {
    return `${dateField} >= (NOW() - '${fromDays} days'::interval)`;
  }

  async acquiredJourneys(fromDays?: number): Promise<number> {
    let query = `SELECT count(*) FROM acquisition.acquisitions`;
    if (fromDays) {
      query = `${query} WHERE ${this.buildWhereClause('created_at', fromDays)}`;
    }
    const results = await this.pg.getClient().query(query);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async acquiredFailedJourneys(fromDays?: number): Promise<number> {
    let query = `SELECT count(*) FROM acquisition.errors WHERE error_resolved = false`;
    if (fromDays) {
      query = `${query} AND ${this.buildWhereClause('created_at', fromDays)}`;
    }
    const results = await this.pg.getClient().query(query);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async allCarpools(fromDays?: number): Promise<number> {
    let query = `SELECT count(*) FROM carpool.carpools`;
    if (fromDays) {
      query = `${query} WHERE ${this.buildWhereClause('created_at', fromDays)}`;
    }
    const results = await this.pg.getClient().query(query);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async missingCarpools(fromDays?: number): Promise<number> {
    let query = `
      SELECT count(cc._id)
      FROM acquisition.acquisitions as aa
      LEFT JOIN carpool.carpools as cc
      ON aa._id = cc.acquisition_id
      WHERE cc.acquisition_id IS NULL
    `;
    if (fromDays) {
      query = `${query} AND ${this.buildWhereClause('aa.created_at', fromDays)}`;
    }
    const results = await this.pg.getClient().query(query);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async missingCarpoolsByDate(fromDays = 14): Promise<{ date: Date; count: number }[]> {
    // TODO : create index on acquisition.acquisitions(created_at)
    const results = await this.pg.getClient().query(`
      WITH data as (
        SELECT
          aa.created_at::date as date
        FROM acquisition.acquisitions as aa
        LEFT JOIN carpool.carpools as cc
        ON aa._id = cc.acquisition_id
        WHERE ${this.buildWhereClause('aa.created_at', fromDays)}
        AND cc.acquisition_id IS NULL
      )
      SELECT
        date,
        count(*) as count
      FROM data
      GROUP BY date
      ORDER BY date desc
    `);

    return results.rows;
  }
}
