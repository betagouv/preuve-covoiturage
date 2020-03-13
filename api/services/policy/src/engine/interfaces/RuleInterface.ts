import { TripInterface } from '../../interfaces/TripInterface';
import { PersonInterface } from '../../interfaces/PersonInterface';
import { MetaInterface } from '../../interfaces/MetaInterface';

import { priority } from '../helpers/priority';
import { type } from '../helpers/type';

export interface RuleHandlerContextInterface {
  person: PersonInterface;
  trip: TripInterface;
  meta: MetaInterface;
  stack: string[];
}

export interface RuleHandlerParamsInterface extends RuleHandlerContextInterface {
  result: number | undefined;
}

export type RuleHandlerInterface = (context: RuleHandlerContextInterface) => Promise<void>;

export interface RuleInterface {
  slug: string;
  parameters?: any;
}

export interface StaticRuleInterface<H = MetaOrApplicableRuleInterface, P = any> {
  slug: string;
  description?: string;
  schema?: { [k: string]: any };
  index?: priority;
  type: type;
  new (params?: P): H;
}

// apply(parameters?: any): RuleHandlerInterface;

export interface AppliableRuleInterface {
  apply(context: RuleHandlerParamsInterface): Promise<void>;
}

export interface MetaRuleInterface {
  build?(): RuleInterface[];
}

export interface FilterRuleInterface extends AppliableRuleInterface {
  filter(context: RuleHandlerContextInterface): Promise<void>;
}

export interface ModifierRuleInterface extends AppliableRuleInterface {
  modify(context: RuleHandlerContextInterface, result: number): Promise<number>;
}

export interface SetterRuleInterface extends AppliableRuleInterface {
  set(context: RuleHandlerContextInterface): Promise<number>;
}

export interface TransformerRuleInterface extends AppliableRuleInterface {
  transform(context: RuleHandlerContextInterface): Promise<RuleHandlerContextInterface>;
}

export type MetaOrApplicableRuleInterface =
  | AppliableRuleInterface
  | FilterRuleInterface
  | MetaRuleInterface
  | ModifierRuleInterface
  | SetterRuleInterface
  | TransformerRuleInterface;
