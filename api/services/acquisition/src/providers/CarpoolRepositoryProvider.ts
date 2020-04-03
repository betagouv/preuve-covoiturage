import { NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CarpoolRepositoryInterface,
  CarpoolRepositoryInterfaceResolver,
  StatusParamsInterface,
  StatusResultInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryInterface {
  public readonly table = 'acquisition.carpools';

  constructor(protected connection: PostgresConnection) {}

  async status(data: StatusParamsInterface): Promise<StatusResultInterface> {
    const { acquisition_id, operator_id, journey_id } = data;

    const result = await this.connection.getClient().query({
      text: `
        SELECT status FROM ${this.table}
        WHERE acquisition_id  = $1
        AND operator_id = $2
        AND journey_id = $3
        LIMIT 1
      `,
      values: [acquisition_id, operator_id, journey_id],
    });

    if (!result.rowCount) {
      throw new NotFoundException();
    }

    return result.rows[0].status;
  }
}
