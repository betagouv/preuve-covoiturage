import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';

import { idfm } from './idfm';
import { maxAmountPerTargetRestriction } from './maxAmountPerTargetRestriction';
import { maxAmountRestriction } from './maxAmountRestriction';
import { maxTripPerTargetRestriction } from './maxTripPerTargetRestriction';
import { maxTripRestriction } from './maxTripRestriction';

export const others: ApplicableRuleInterface[] = [
  idfm,
  maxAmountPerTargetRestriction,
  maxAmountRestriction,
  maxTripPerTargetRestriction,
  maxTripRestriction,
];
