import { StaticRuleInterface } from '../interfaces/RuleInterface';

/* import rules by types */
import { filters } from './filters';
import { modifiers } from './modifiers';
import { setters } from './setters';

/* import other rules */
import { others } from './others';

export const rules: StaticRuleInterface[] = [
  ...filters,
  ...modifiers,
  ...setters,
  ...others,
];
