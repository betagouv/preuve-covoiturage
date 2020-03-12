import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

export interface JourneyRepositoryProviderInterface {
  acquiredJourneys(): Promise<number>;
  acquiredFailedJourneys(): Promise<number>;
  allCarpools(): Promise<number>;
  missingCarpools(): Promise<number>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async acquiredJourneys(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async acquiredFailedJourneys(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async allCarpools(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async missingCarpools(): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

@provider({ identifier: JourneyRepositoryProviderInterfaceResolver })
export class JourneyRepositoryProvider implements JourneyRepositoryProviderInterface {
  constructor(private pg: PostgresConnection) {}

  async acquiredJourneys(): Promise<number> {
    const results = await this.pg.getClient().query(`SELECT count(*) FROM acquisition.acquisitions`);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async acquiredFailedJourneys(): Promise<number> {
    const results = await this.pg.getClient().query(`SELECT count(*) FROM acquisition.errors`);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async allCarpools(): Promise<number> {
    const results = await this.pg.getClient().query(`SELECT count(*) FROM carpool.carpools`);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }

  async missingCarpools(): Promise<number> {
    const results = await this.pg.getClient().query(`
      SELECT count(cc._id)
      FROM acquisition.acquisitions as aa
      LEFT JOIN carpool.carpools as cc
      ON aa._id = cc.acquisition_id
      WHERE cc.acquisition_id IS NULL
    `);

    return results.rowCount ? parseInt(results.rows[0].count, 10) : -1;
  }
}
