import { IncentiveInterface } from '../campaign/incentiveInterface';

import { TripStatusEnum } from '../../enums/trip/trip-status.enum';
import { TripRankEnum } from '../../enums/trip/trip-rank.enum';

export interface TripInterface {
  _id: string;
  status: TripStatusEnum;
  start: Date;
  people: PersonInterface[];
  class: TripRankEnum;
  campaigns: CampaignShortInterface[];
}

export interface PersonInterface {
  class: TripRankEnum;
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
