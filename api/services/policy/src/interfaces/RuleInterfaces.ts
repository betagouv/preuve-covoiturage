import { RuleInterface, TripInterface, PersonInterface } from '@pdc/provider-schema';

export interface MetaInterface {
  get(key: string, fallback?: any): any;
  set(key: string, data: any): void;
  all(): { [k: string]: any };
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
