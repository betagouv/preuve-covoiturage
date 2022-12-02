import { SimulateOnPasGeoRequiredParams } from '../policy/simulateOnPastGeo.contract';

export interface ParamsInterface {
  name: string;
  firstname: string;
  job: string;
  email: string;
  territory_name;
  simulation: SimulateOnPasGeoRequiredParams;
}

export const handlerConfig = {
  service: 'user',
  method: 'sendSimulationEmail',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
