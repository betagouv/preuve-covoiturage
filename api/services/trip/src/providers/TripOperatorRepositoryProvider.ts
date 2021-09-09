import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { TzResultInterface } from '../interfaces';

@provider()
export class TripOperatorRepositoryProvider {
  public readonly table = 'trip.list';
  private defaultTz: TzResultInterface = { name: 'GMT', utc_offset: '00:00:00' };

  constructor(public connection: PostgresConnection) {}

  public async getInvoledOperators(campaign_id: number): Promise<number[]> {
    return null;
  }
}
