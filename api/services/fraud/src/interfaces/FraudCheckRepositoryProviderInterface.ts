import { FraudCheck } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  createOrUpdateMany(completedFraudCheck: FraudCheck[]): Promise<void>;
  getScore(acquisitionId: number): Promise<number>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  abstract getScore(acquisitionId: number): Promise<number>;
  abstract createOrUpdateMany(completedFraudCheck: FraudCheck[]): Promise<void>;
}
