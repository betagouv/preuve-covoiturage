// tslint:disable-next-line:max-line-length
import { CampaignNameInterface } from '~/modules/campaign/modules/campaign-ui/components/campaign-auto-complete/campaign-auto-complete.component';
import { OperatorNameInterface } from '~/core/interfaces/operator/operatorInterface';
import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';

export interface FilterInterface {
  filter?: {
    'campaigns._id'?: string;
    'people.start.date'?: {
      $gte: Date;
    };
    'people.end.date'?: {
      $lt: Date;
    };
    status?: TripStatusEnum;
    'people.town'?: {
      $in: string[];
    };
    'people.distance'?: {
      $gte?: number;
      $lt?: number;
    };
    'people.class'?: {
      $in: TripClassEnum[];
    };
    'people.operator._id'?: {
      $in: string[];
    };
    territories?: {
      $in: string[];
    };
  };
  hours?: {
    start?: string;
    end?: string;
  };
  days?: weekDaysType[];
}

export interface FilterViewInterface {
  campaign: CampaignNameInterface;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  days: weekDaysType[];
  towns: string[];
  minDistance: number;
  maxDistance: number;
  classes: TripClassEnum[];
  status: TripStatusEnum;
  operators: OperatorNameInterface[];
  territories: TerritoryNameInterface[];
}

type weekDaysType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
