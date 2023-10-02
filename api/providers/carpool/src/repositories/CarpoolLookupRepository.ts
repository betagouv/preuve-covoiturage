import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Id } from '../interfaces';
import { SelectableCarpoolStatus } from '../interfaces/database/lookup';

@provider()
export class CarpoolLookupRepository {
  constructor(protected connection: PostgresConnection) {}

  public async findOne(
    operator_id: Id,
    operator_journey_id: Id,
    client?: PoolClient,
  ): Promise<SelectableCarpoolStatus> {
    throw new Error();
  }
}
