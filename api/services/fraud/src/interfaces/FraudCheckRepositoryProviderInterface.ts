import { FraudCheck, DefaultMetaInterface } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  findOrCreateFraudCheck<T = DefaultMetaInterface>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  updateFraudCheck(fraud: FraudCheck): Promise<void>;
  getScore(acquisitionId: number): Promise<number>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  abstract getScore(acquisitionId: number): Promise<number>;
  abstract findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  abstract updateFraudCheck(fraud: FraudCheck): Promise<void>;
}
