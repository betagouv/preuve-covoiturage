import { RuleHandlerInterface } from './RuleHandlerInterface';

export interface RuleInterface {
  slug: string;
  description?: string;
  parameters?: any;
  schema?: { [k: string]: any };

  formula?: string;
  index?: number;
}

export interface ApplicableRuleInterface extends RuleInterface {
  apply(parameters?: any): RuleHandlerInterface;
}
