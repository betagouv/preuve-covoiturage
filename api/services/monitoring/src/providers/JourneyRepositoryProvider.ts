import { PostgresConnection } from '@ilos/connection-postgres';

export interface JourneyRepositoryProviderInterface {
  missingCarpools(): Promise<number>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async missingCarpools(): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

export class JourneyRepositoryProvider extends JourneyRepositoryProviderInterfaceResolver {
  constructor(private pg: PostgresConnection) {
    super();
  }
  async missingCarpools(): Promise<number> {
    const results = await this.pg.getClient().query(`
      SELECT count(cc._id)
      FROM acquisition.acquisitions as aa
      LEFT JOIN carpool.carpools as cc
      ON aa._id = cc.acquisition_id
      WHERE cc.acquisition_id IS NULL
    `);

    return results.rows[0] || -1;
  }
}
