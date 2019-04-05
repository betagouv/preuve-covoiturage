import { Injectable } from '@angular/core';

import { WeekDayFilter } from '../filters/WeekDayFilter';
import { TimeFilter } from '../filters/TimeFilter';
import { RangeFilter } from '../filters/RangeFilter';
import { RankFilter } from '../filters/RankFilter';

const FILTERS = [
  WeekDayFilter,
  TimeFilter,
  RangeFilter,
  RankFilter,
];

@Injectable()
export class IncentiveFilterService {
  public get() {
    return [...FILTERS];
  }
}
