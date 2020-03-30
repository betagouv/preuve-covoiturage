import { AcquisitionErrorInterface } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';
import { ParamsInterface as ResolveInterface } from '../shared/acquisition/resolveerror.contract';
import { ParamsInterface as SearchErrorsInterface } from '../shared/acquisition/searcherrors.contract';
import { ParamsInterface as SummaryErrorsInterface } from '../shared/acquisition/summaryerrors.contract';
import { ResultInterface as SummaryResultInterface } from '../shared/acquisition/summaryerrors.contract';

export interface ErrorRepositoryProviderInterface {
  create(data: AcquisitionErrorInterface): Promise<{ _id: number; created_at: Date }>;
}

export abstract class ErrorRepositoryProviderInterfaceResolver implements ErrorRepositoryProviderInterface {
  async search(data: SearchErrorsInterface): Promise<AcquisitionErrorInterface[]> {
    throw new Error('Not implemented');
  }

  async create(data: AcquisitionErrorInterface): Promise<{ _id: number; created_at: Date }> {
    throw new Error('Not implemented');
  }

  async resolve(data: ResolveInterface): Promise<number> {
    throw new Error('Not implemented');
  }

  async summary(filter: SummaryErrorsInterface): Promise<SummaryResultInterface> {
    throw new Error('Not implemented');
  }
}
