import { TerritoryTripsInterface } from '../../interfaces/TerritoryTripsInterface';
import { TripSearchInterface } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface {
  filepath: string;
  tripSearchQueryParam: TripSearchInterface;
  excludedTerritories: TerritoryTripsInterface[];
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'publishOpenData',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
