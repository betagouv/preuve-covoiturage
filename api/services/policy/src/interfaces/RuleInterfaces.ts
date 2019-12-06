import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { TripInterface } from '../shared/common/interfaces/TripInterface';
import { RuleInterface } from '../shared/common/interfaces/RuleInterface';

export interface MetaInterface {
  signature: any;
  get(key: string, fallback?: any): any;
  set(key: string, data: any): void;
  all(): { [k: string]: any };
  keys(): string[];
}

export interface RuleHandlerContextInterface {
  result: number;
  person: PersonInterface;
  trip: TripInterface;
  meta: MetaInterface;
}
export type RuleHandlerInterface = (context: RuleHandlerContextInterface, next: () => Promise<void>) => Promise<void>;

export interface ApplicableRuleInterface extends RuleInterface {
  apply(parameters?: any): RuleHandlerInterface;
}
