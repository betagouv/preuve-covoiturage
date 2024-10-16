import { CeeSimulateInterface } from './common/CeeApplicationInterface.ts';

export type ParamsInterface = CeeSimulateInterface;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'cee',
  method: 'simulateCeeApplication',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
