import { CeeImportInterface, CeeImportResultInterface } from './common/CeeApplicationInterface';

export type ParamsInterface = Array<CeeImportInterface<Date>>;

export type ResultInterface = CeeImportResultInterface<CeeImportInterface<string> & { error: string }>;

export const handlerConfig = {
  service: 'cee',
  method: 'importCeeApplication',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
