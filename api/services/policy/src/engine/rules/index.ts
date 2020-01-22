import { StaticRuleInterface } from '../interfaces/RuleInterface';

/* import rules by types */
import { filters } from './filters';
import { modifiers } from './modifiers';
import { setters } from './setters';
import { posts } from './posts';
import { metas } from './metas';
import { transformers } from './transformers';

export const rules: StaticRuleInterface[] = [...filters, ...modifiers, ...setters, ...posts, ...metas, ...transformers];
