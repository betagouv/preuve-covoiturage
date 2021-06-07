import { PublicTripSearchInterface } from './common/interfaces/PublicTripStatInterface';

export interface ParamsInterface extends PublicTripSearchInterface {}

export const handlerConfig = {
  service: 'trip',
  method: 'publicStats',
};
