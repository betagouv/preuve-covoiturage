import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  FraudCheckRepositoryProviderInterface,
  FraudCheckRepositoryProviderInterfaceResolver,
  FraudCheck,
} from '../interfaces';

/*
 * Trip specific repository
 */
@provider({
  identifier: FraudCheckRepositoryProviderInterfaceResolver,
})
export class FraudCheckRepositoryProvider implements FraudCheckRepositoryProviderInterface {
  constructor(public connection: PostgresConnection) {}

  public async findOrCreateFraudCheck(acquisitionId: string, method: string): Promise<FraudCheck> {
    throw new Error();
  }

  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    throw new Error();
  }
}
