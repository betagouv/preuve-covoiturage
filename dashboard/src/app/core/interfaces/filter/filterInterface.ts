import { WeekDay } from '@angular/common';

// tslint:disable-next-line:max-line-length
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';

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
  ranks: TripRankEnum[];
  status: TripStatusEnum;
  operator_ids: string[];
  territoryIds: string[];
}
