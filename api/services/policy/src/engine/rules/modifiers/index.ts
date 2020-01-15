import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';

import { perPassengerModifier } from './perPassengerModifier';
import { perSeatModifier } from './perSeatModifier';
import { perKmModifier } from './perKmModifier';

export const modifiers: ApplicableRuleInterface[] = [perKmModifier, perSeatModifier, perPassengerModifier];
