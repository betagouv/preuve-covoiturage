import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CarpoolRepositoryInterface,
  CarpoolRepositoryInterfaceResolver,
  StatusResultInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryInterface {
  public readonly table = 'acquisition.carpools';

  constructor(protected connection: PostgresConnection) {}

  async getStatusByAcquisitionId(acquisitionId: number | null): Promise<StatusResultInterface | undefined> {
    if (!acquisitionId) {
      return undefined;
    }

    const result = await this.connection.getClient().query({
      text: `
        SELECT status FROM ${this.table}
        WHERE acquisition_id  = $1
        ORDER BY is_driver DESC
        LIMIT 1
      `,
      values: [acquisitionId],
    });

    if (!result.rowCount) {
      return undefined;
    }

    return result.rows[0].status;
  }
}
