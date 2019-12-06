import { TripInterface } from './TripInterface';
import { PersonInterface } from './PersonInterface';
import { MetaInterface } from './MetaInterface';

export interface RuleHandlerContextInterface {
  result: number;
  person: PersonInterface;
  trip: TripInterface;
  meta: MetaInterface;
}
export type RuleHandlerInterface = (context: RuleHandlerContextInterface, next: () => Promise<void>) => Promise<void>;
