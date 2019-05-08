import { Injectable } from '@angular/core';

import { InseeFilter } from '~/modules/incentive/filters/InseeFilter';

import { WeekDayFilter } from '../filters/WeekDayFilter';
import { TimeFilter } from '../filters/TimeFilter';
import { RangeFilter } from '../filters/RangeFilter';
import { RankFilter } from '../filters/RankFilter';


const FILTERS = [
  WeekDayFilter,
  TimeFilter,
  RangeFilter,
  RankFilter,
  InseeFilter,
];

@Injectable()
export class IncentiveFilterService {
  public get() {
    return [...FILTERS];
  }
}
