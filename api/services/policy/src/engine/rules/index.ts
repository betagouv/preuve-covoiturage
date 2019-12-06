import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';

import { adultOnlyFilter } from './adultOnlyFilter';
import { distanceRangeFilter } from './distanceRangeFilter';
import { inseeBlacklistFilter, inseeWhitelistFilter } from './inseeFilter';
import { maxAmountPerTargetRestriction } from './maxAmountPerTargetRestriction';
import { maxAmountRestriction } from './maxAmountRestriction';
import { maxTripPerTargetRestriction } from './maxTripPerTargetRestriction';
import { maxTripRestriction } from './maxTripRestriction';
import { operatorWhitelistFilter } from './operatorWhitelistFilter';
import { rankWhitelistFilter } from './rankWhitelistFilter';
import { timeRangeFilter } from './timeRangeFilter';
import { weekdayFilter } from './weekdayFilter';
import { costBasedAmount } from './costBasedAmount';
import { fixedAmount } from './fixedAmount';
import { perPassenger } from './perPassenger';
import { perKm } from './perKm';
import { passengerOnlyFilter } from './passengerOnlyFilter';
import { driverOnlyFilter } from './driverOnlyFilter';

export const policies: ApplicableRuleInterface[] = [
  adultOnlyFilter,
  passengerOnlyFilter,
  driverOnlyFilter,
  costBasedAmount,
  distanceRangeFilter,
  fixedAmount,
  inseeBlacklistFilter,
  inseeWhitelistFilter,
  maxAmountPerTargetRestriction,
  maxAmountRestriction,
  maxTripPerTargetRestriction,
  maxTripRestriction,
  operatorWhitelistFilter,
  perKm,
  perPassenger,
  rankWhitelistFilter,
  timeRangeFilter,
  weekdayFilter,
];
