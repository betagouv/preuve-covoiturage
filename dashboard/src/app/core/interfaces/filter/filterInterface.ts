import { WeekDay } from '@angular/common';

// tslint:disable-next-line:max-line-length
import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { CampaignNameInterface } from '~/core/interfaces/campaign/campaign-name.interface';

export interface FilterInterface {
  campaignIds: string[];
  date: {
    start: Date;
    end: Date;
  };
  hour: {
    start: string;
    end: string;
  };
  days: WeekDay[];
  towns: string[];
  distance: {
    min: number;
    max: number;
  };
  ranks: TripClassEnum[];
  status: TripStatusEnum;
  operatorIds: string[];
  territoryIds: string[];
}

export interface FilterViewInterface {
  campaign: CampaignNameInterface;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  days: WeekDay[];
  towns: string[];
  minDistance: number;
  maxDistance: number;
  classes: TripClassEnum[];
  status: TripStatusEnum;
  operators: OperatorNameInterface[];
  territories: TerritoryNameInterface[];
}
