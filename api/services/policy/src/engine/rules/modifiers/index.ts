import { StaticRuleInterface } from '../../interfaces/RuleInterface';

import { PerPassengerModifier } from './PerPassengerModifier';
import { PerSeatModifier } from './PerSeatModifier';
import { PerKmModifier } from './PerKmModifier';
import { BoundedModifier } from './BoundedModifier';

export const modifiers: StaticRuleInterface[] = [PerKmModifier, PerSeatModifier, PerPassengerModifier, BoundedModifier];
