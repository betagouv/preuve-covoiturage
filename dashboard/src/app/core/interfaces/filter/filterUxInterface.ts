import { WeekDay } from '@angular/common';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

export interface FilterUxInterface {
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
  insees: InseeAndTerritoryInterface[];
  distance: {
    min: number;
    max: number;
  };
  ranks: TripRankEnum[];
  status: TripStatusEnum;
  operatorIds: string[];
  territoryIds: string[];
}
