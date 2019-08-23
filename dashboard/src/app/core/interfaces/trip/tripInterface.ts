import { IncentiveInterface } from '../campaign/incentiveInterface';

import { TripStatusEnum } from '../../enums/trip/trip-status.enum';
import { TripClassEnum } from '../../enums/trip/trip-class.enum';

export interface TripInterface {
  _id: string;
  status: TripStatusEnum;
  start: Date;
  people: PersonInterface[];
  class: TripClassEnum;
  campaigns: CampaignShortInterface[];
}

export interface PersonInterface {
  class: TripClassEnum;
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
