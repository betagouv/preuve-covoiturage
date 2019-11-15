import { FraudCheck, FraudCheckResult } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  updateFraudCheck(fraud: FraudCheck): Promise<void>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  public async findOrCreateFraudCheck<T= any>(acquisitionId: number, method: string): Promise<FraudCheck<T>> {
    throw new Error();
  }

  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    throw new Error();
  }
}
