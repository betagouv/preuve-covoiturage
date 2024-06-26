import { PersonInterface } from './PersonInterface.ts';

export interface JourneyInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class: string;
  passenger?: PersonInterface;
  driver?: PersonInterface;
}
