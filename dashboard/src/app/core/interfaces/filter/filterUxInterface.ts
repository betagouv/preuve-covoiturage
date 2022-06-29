import { WeekDay } from '@angular/common';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { TerritorySelectorsInterface } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';
import { SingleResultInterface as GeoSingleResultInterface } from '~/shared/territory/findGeoByName.contract';

export interface FilterUxInterface {
  campaignIds: number[];
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
  operatorIds: number[];
  territoryIds: GeoSingleResultInterface[];
  geo_selector: TerritorySelectorsInterface;
}
