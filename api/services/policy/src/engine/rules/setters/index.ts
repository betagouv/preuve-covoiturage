import { ApplicableRuleInterface } from '../../../interfaces/RuleInterface';

import { costBasedAmountSetter } from './costBasedAmountSetter';
import { fixedAmountSetter } from './fixedAmountSetter';

export const setters: ApplicableRuleInterface[] = [fixedAmountSetter, costBasedAmountSetter];
