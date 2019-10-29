// tslint:disable:variable-name
import { IncentiveInterface } from '../campaign/incentiveInterface';

import { TripStatusEnum } from '../../enums/trip/trip-status.enum';
import { TripRankEnum } from '../../enums/trip/trip-rank.enum';

export interface TripInterface {
  status: TripStatusEnum;
  trip_id: number;
  start_town: string;
  start_datetime: string;
  operator_class: string;
  operator_id: string;
  end_town: string;
  incentives: [];
  campaigns_id: string[];
}

// export interface PersonInterface {
//   rank: TripRankEnum;
//   operator_id: string;
//   is_driver: boolean;
//   start_town: string;
//   end_town: string;
//   incentives: IncentiveInterface[];
// }

// export interface CampaignShortInterface {
//   name: string;
// }
