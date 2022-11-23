import { CeeSimulateInterface, CeeSimulateResultInterface } from './common/CeeApplicationInterface';

export type ParamsInterface = CeeSimulateInterface;

export type ResultInterface = void | CeeSimulateResultInterface;

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateCeeApplication',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
