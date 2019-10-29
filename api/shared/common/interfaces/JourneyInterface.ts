import { PersonInterface } from './PersonInterface';

export interface JourneyInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class: string;
  operator_id: string;
  passenger?: PersonInterface;
  driver?: PersonInterface;
}
