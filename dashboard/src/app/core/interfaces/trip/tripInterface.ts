// tslint:disable:variable-name
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
  rank: TripRankEnum;
  operator_id: string;
  is_driver: boolean;
  start_town: string;
  end_town: string;
  incentives: IncentiveInterface[];
}

export interface CampaignShortInterface {
  name: string;
}
