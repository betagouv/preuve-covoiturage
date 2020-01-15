import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';

/* import rules by types */
import { filters } from './filters';
import { modifiers } from './modifiers';
import { setters } from './setters';

/* import other rules */
import { others } from './others';

export const policies: ApplicableRuleInterface[] = [
  ...Object.values(filters),
  ...Object.values(modifiers),
  ...Object.values(setters),
  ...Object.values(others),
];
