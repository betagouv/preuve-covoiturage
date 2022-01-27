import { StaticRuleInterface } from '../../interfaces';
import { MaxAmountRestriction } from './MaxAmountRestriction';
import { MaxTripRestriction } from './MaxTripRestriction';
import { MaxPassengerRestriction } from './MaxPassengerRestriction';

export const stateful: StaticRuleInterface[] = [MaxAmountRestriction, MaxTripRestriction, MaxPassengerRestriction];
