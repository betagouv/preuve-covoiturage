import { SimulateOnPastGeoRequiredParams } from '../policy/simulateOnPastGeo.contract.ts';

export interface ParamsInterface {
  name: string;
  firstname: string;
  job: string;
  email: string;
  territory_name: string;
  simulation: SimulateOnPastGeoRequiredParams;
}

export const handlerConfig = {
  service: 'user',
  method: 'sendSimulationEmail',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
