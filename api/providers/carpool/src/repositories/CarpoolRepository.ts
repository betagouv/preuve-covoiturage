import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import sql, { empty, join, raw } from 'sql-template-tag';
import { Id, InsertableCarpool, UpdatableCarpool, Uuid, WritenCarpool } from '../interfaces';

@provider()
export class CarpoolRepository {
  constructor(protected connection: PostgresConnection) {}

  public async register(data: InsertableCarpool, client?: PoolClient): Promise<WritenCarpool> {
    throw new Error();
  }

  public async update(
    operator_id: Id,
    operator_journey_id: Uuid,
    data: UpdatableCarpool,
    client?: PoolClient,
  ): Promise<WritenCarpool> {
    throw new Error();
  }
}
