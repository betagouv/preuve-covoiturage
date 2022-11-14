import { CeeSimulateInterface } from './common/CeeApplicationInterface';

export type ParamsInterface = CeeSimulateInterface;

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateCeeApplication',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
