import { WeekDay } from '@angular/common';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';

export interface FilterInterface {
  campaign_id?: number[];
  date?: {
    start: Date;
    end: Date;
  };
  hour?: {
    start: number;
    end: number;
  };
  days?: WeekDay[];
  towns?: string[];
  distance?: {
    min: number;
    max: number;
  };
  ranks?: TripRankEnum[];
  status?: TripStatusEnum;
  operator_id?: number[];
  territory_id?: number[];
}
