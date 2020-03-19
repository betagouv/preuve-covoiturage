import { AcquisitionErrorInterface } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';
import { ParamsInterface as ResolveInterface } from '../shared/acquisition/resolveerror.contract';

export interface ErrorRepositoryProviderInterface {
  create(data: AcquisitionErrorInterface): Promise<{ _id: number; created_at: Date }>;
}

export abstract class ErrorRepositoryProviderInterfaceResolver implements ErrorRepositoryProviderInterface {
  async create(data: AcquisitionErrorInterface): Promise<{ _id: number; created_at: Date }> {
    throw new Error('Not implemented');
  }

  async resolve(data: ResolveInterface): Promise<number> {
    throw new Error('Not implemented');
  }
}
