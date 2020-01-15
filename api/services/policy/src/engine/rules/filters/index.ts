import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';

import { adultOnlyFilter } from './adultOnlyFilter';
import { distanceRangeFilter } from './distanceRangeFilter';
import { inseeBlacklistFilter, inseeWhitelistFilter } from './inseeFilter';
import { operatorWhitelistFilter } from './operatorWhitelistFilter';
import { rankWhitelistFilter } from './rankWhitelistFilter';
import { timeRangeFilter } from './timeRangeFilter';
import { weekdayFilter } from './weekdayFilter';
import { passengerOnlyFilter } from './passengerOnlyFilter';
import { driverOnlyFilter } from './driverOnlyFilter';

export const filters: ApplicableRuleInterface[] = [
  adultOnlyFilter,
  distanceRangeFilter,
  passengerOnlyFilter,
  driverOnlyFilter,
  inseeBlacklistFilter,
  inseeWhitelistFilter,
  operatorWhitelistFilter,
  rankWhitelistFilter,
  timeRangeFilter,
  weekdayFilter,
];
