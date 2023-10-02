import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { InsertableCarpoolRequest, WritenCarpoolRequest } from '../interfaces';

@provider()
export class CarpoolRequestRepository {
  constructor(protected connection: PostgresConnection) {}

  public async save(data: InsertableCarpoolRequest, client?: PoolClient): Promise<WritenCarpoolRequest> {
    throw new Error();
  }
}
