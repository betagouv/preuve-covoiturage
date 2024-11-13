import { CeeApplicationResultInterface, CeeApplicationInterface } from './common/CeeApplicationInterface.ts';

export type ParamsInterface = CeeApplicationInterface;

export interface ResultInterface extends CeeApplicationResultInterface {}

export const handlerConfig = {
  service: 'cee',
  method: 'registerCeeApplication',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
