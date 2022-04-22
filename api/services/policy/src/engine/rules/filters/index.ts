import { StaticRuleInterface } from '../../interfaces/RuleInterface';

import { AdultOnlyFilter } from './AdultOnlyFilter';
import { DateFilter } from './DateFilter';
import { DistanceRangeFilter } from './DistanceRangeFilter';
import { DriverOnlyFilter } from './DriverOnlyFilter';
import { TerritoryBlacklistFilter, TerritoryWhitelistFilter } from './TerritoryFilter';
import { OperatorWhitelistFilter } from './OperatorWhitelistFilter';
import { RankWhitelistFilter } from './RankWhitelistFilter';
import { TimeRangeFilter } from './TimeRangeFilter';
import { WeekdayFilter } from './WeekdayFilter';
import { PassengerOnlyFilter } from './PassengerOnlyFilter';

export const filters: StaticRuleInterface[] = [
  AdultOnlyFilter,
  DateFilter,
  DistanceRangeFilter,
  DriverOnlyFilter,
  OperatorWhitelistFilter,
  PassengerOnlyFilter,
  RankWhitelistFilter,
  TerritoryBlacklistFilter,
  TerritoryWhitelistFilter,
  TimeRangeFilter,
  WeekdayFilter,
];
