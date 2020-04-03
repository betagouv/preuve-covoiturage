import {
  ErrorStage,
  AcquisitionErrorInterface,
} from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';
import {
  ParamsInterface as LogParamsInterface,
  ResultInterface as LogResultInterface,
} from '../shared/acquisition/logerror.contract';
import {
  ParamsInterface as ResolveParamsInterface,
  ResultInterface as ResolveResultInterface,
} from '../shared/acquisition/resolveerror.contract';

export interface SearchParamsInterface {
  journey_id?: string;
  operator_id?: number;
  error_stage?: ErrorStage;
  start_date?: Date;
  end_date?: Date;
  error_code?: string;
}

enum GroupByOptions {
  operator_id = 'operator_id',
  journey_id = 'journey_id',
  error_stage = 'error_stage',
}

export interface SummaryParamsInterface extends SearchParamsInterface {
  group_by: GroupByOptions;
}

export interface ErrorRepositoryProviderInterface {
  search(data: SearchParamsInterface): Promise<AcquisitionErrorInterface[]>;
  log(data: LogParamsInterface): Promise<LogResultInterface>;
  resolve(data: ResolveParamsInterface): Promise<number>;
  summary(filter: SummaryParamsInterface): Promise<{ [key: string]: number }>;
  find(data: { journey_id: string; operator_id?: number }): Promise<AcquisitionErrorInterface>;
}

export abstract class ErrorRepositoryProviderInterfaceResolver implements ErrorRepositoryProviderInterface {
  async search(data: SearchParamsInterface): Promise<AcquisitionErrorInterface[]> {
    throw new Error('Not implemented');
  }

  async log(data: LogParamsInterface): Promise<LogResultInterface> {
    throw new Error('Not implemented');
  }

  async resolve(data: ResolveParamsInterface): Promise<ResolveResultInterface> {
    throw new Error('Not implemented');
  }

  async summary(filter: SummaryParamsInterface): Promise<{ [key: string]: number }> {
    throw new Error('Not implemented');
  }

  async find(data: { journey_id: string; operator_id?: number }): Promise<AcquisitionErrorInterface> {
    throw new Error('Not implemented');
  }
}
