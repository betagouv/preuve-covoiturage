import { CeeImportInterface, CeeImportResultInterface } from './common/CeeApplicationInterface';

export type ParamsInterface = Array<CeeImportInterface>;

export type ResultInterface = CeeImportResultInterface;

export const handlerConfig = {
  service: 'campaign',
  method: 'importCeeApplication',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
