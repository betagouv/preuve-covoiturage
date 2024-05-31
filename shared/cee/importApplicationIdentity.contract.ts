import { CeeImportIdentityInterface, CeeImportResultInterface } from './common/CeeApplicationInterface.ts';

export type ParamsInterface = Array<CeeImportIdentityInterface>;

export type ResultInterface = CeeImportResultInterface<CeeImportIdentityInterface & { error: string }>;

export const handlerConfig = {
  service: 'cee',
  method: 'importCeeApplicationIdentity',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
