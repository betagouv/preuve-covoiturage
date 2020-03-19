import { StaticRuleInterface } from '../../interfaces';
import { MaxAmountRestriction } from './MaxAmountRestriction';
import { MaxTripRestriction } from './MaxTripRestriction';

export const stateful: StaticRuleInterface[] = [MaxAmountRestriction, MaxTripRestriction];
