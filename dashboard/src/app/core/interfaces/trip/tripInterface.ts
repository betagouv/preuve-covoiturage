import { IncentiveInterface } from '../campaign/incentiveInterface';

import { TripStatus } from '../../entities/trip/trip-status';
import { TripClass } from '../../entities/trip/trip-class';

export interface TripInterface {
  _id: string;
  status: TripStatus;
  start: Date;
  people: PersonInterface[];
  class: TripClass;
  campaigns: CampaignShortInterface[];
}

export interface PersonInterface {
  class: TripClass;
  operator: {
    _id: string;
    // tslint:disable-next-line:variable-name
    nom_commercial: string;
  };
  is_driver: boolean;
  start: string;
  end: string;
  incentives: IncentiveInterface[];
}

export interface CampaignShortInterface {
  name: string;
}
