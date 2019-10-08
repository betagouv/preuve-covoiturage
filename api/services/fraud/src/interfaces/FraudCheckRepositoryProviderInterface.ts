import { FraudCheck } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  findOrCreateFraudCheck(acquisitionId: string, method: string): Promise<FraudCheck>;
  updateFraudCheck(fraud: FraudCheck): Promise<void>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  public async findOrCreateFraudCheck(acquisitionId: string, method: string): Promise<FraudCheck> {
    throw new Error();
  }

  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    throw new Error();
  }
}
