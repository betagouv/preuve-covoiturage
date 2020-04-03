import { AcquisitionErrorInterface } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';
import {
  ParamsInterface as LogParamsInterface,
  ResultInterface as LogResultInterface,
} from '../shared/acquisition/logerror.contract';
import {
  ParamsInterface as ResolveParamsInterface,
  ResultInterface as ResolveResultInterface,
} from '../shared/acquisition/resolveerror.contract';
import {
  ParamsInterface as SearchParamsInterface,
  ResultInterface as SearchResultInterface,
} from '../shared/acquisition/searcherrors.contract';
import {
  ParamsInterface as SummaryParamsInterface,
  ResultInterface as SummaryResultInterface,
} from '../shared/acquisition/summaryerrors.contract';

export interface ErrorRepositoryProviderInterface {
  search(data: SearchParamsInterface): Promise<AcquisitionErrorInterface[]>;
  log(data: LogParamsInterface): Promise<LogResultInterface>;
  resolve(data: ResolveParamsInterface): Promise<number>;
  summary(filter: SummaryParamsInterface): Promise<SummaryResultInterface>;
}

export abstract class ErrorRepositoryProviderInterfaceResolver implements ErrorRepositoryProviderInterface {
  async search(data: SearchParamsInterface): Promise<SearchResultInterface> {
    throw new Error('Not implemented');
  }

  async log(data: LogParamsInterface): Promise<LogResultInterface> {
    throw new Error('Not implemented');
  }

  async resolve(data: ResolveParamsInterface): Promise<ResolveResultInterface> {
    throw new Error('Not implemented');
  }

  async summary(filter: SummaryParamsInterface): Promise<SummaryResultInterface> {
    throw new Error('Not implemented');
  }
}
