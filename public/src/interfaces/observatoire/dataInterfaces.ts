import { Feature } from 'maplibre-gl';
import { Direction, Distance, Hour, PerimeterLabel, INSEECode, PerimeterType } from './Perimeter';

export interface KeyFiguresDataInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  passengers: number;
  distance: number;
  duration: number;
  journeys: number;
  intra_journeys: number;
  trips: number;
  has_incentive: number;
  occupation_rate: number;
}

export interface LastFluxDataInterface {
  year: number,
  month: number
}

export interface FluxDataInterface {
  ter_1: INSEECode;
  lng_1: number;
  lat_1: number;
  ter_2: INSEECode;
  lng_2: number;
  lat_2: number;
  passengers: number;
  distance: number;
  duration: number;
}

export interface DensiteDataInterface {
  hex: string;
  count: number;
}

export interface OccupationDataInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  journeys: number;
  has_incentive: number;
  occupation_rate: number;
  geom: Feature;
}

export interface TerritoryListInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  type: PerimeterType;
}

export interface EvolDataInterface {
  year: number;
  month: number;
}

export interface EvolJourneysDataInterface extends EvolDataInterface {
  journeys: number;
}
export interface EvolDistanceDataInterface extends EvolDataInterface {
  distance: number;
}

export interface DistributionDistanceDataInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  direction: Direction;
  distances: Array<Distance>;
}
export interface DistributionHoraireDataInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  direction: Direction;
  hours: Array<Hour>;
}

export interface BestFluxDataInterface {
  territory_1: INSEECode;
  l_territory_1: PerimeterLabel;
  territory_2: INSEECode;
  l_territory_2: string;
  journeys: number;
}

export interface BestTerritoriesDataInterface {
  territory: INSEECode;
  l_territory: PerimeterLabel;
  journeys: number;
}
