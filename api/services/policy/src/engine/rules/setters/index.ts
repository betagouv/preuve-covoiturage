import { StaticRuleInterface } from '../../interfaces/RuleInterface';

import { CostBasedAmountSetter } from './CostBasedAmountSetter';
import { FixedAmountSetter } from './FixedAmountSetter';

export const setters: StaticRuleInterface[] = [FixedAmountSetter, CostBasedAmountSetter];
