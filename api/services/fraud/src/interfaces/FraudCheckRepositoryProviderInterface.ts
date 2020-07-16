import { FraudCheckEntry } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  get(acquisitionId: number): Promise<FraudCheckEntry>;
  createOrUpdate(data: FraudCheckEntry): Promise<void>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  abstract get(acquisitionId: number): Promise<FraudCheckEntry>;
  abstract createOrUpdate(data: FraudCheckEntry): Promise<void>;
}
