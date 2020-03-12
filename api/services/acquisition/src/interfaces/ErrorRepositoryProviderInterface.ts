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
import {
  ParamsInterface as FindParamsInterface,
  ResultInterface as FindResultInterface,
} from '../shared/acquisition/finderrors.contract';

export interface ErrorRepositoryProviderInterface {
  search(data: SearchParamsInterface): Promise<SearchResultInterface>;
  log(data: LogParamsInterface): Promise<LogResultInterface>;
  resolve(data: ResolveParamsInterface): Promise<number>;
  summary(filter: SummaryParamsInterface): Promise<SummaryResultInterface>;
  find(params: FindParamsInterface): Promise<FindResultInterface>;
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

  async find(params: FindParamsInterface): Promise<FindResultInterface> {
    throw new Error('Not implemented');
  }
}
