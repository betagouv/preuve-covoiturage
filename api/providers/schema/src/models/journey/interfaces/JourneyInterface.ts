import { PersonInterface } from '../../person';

export interface JourneyInterface {
  _id?: string;
  journey_id: string;
  operator_journey_id?: string;
  operator_class: string;
  operator_id: string;
  passenger?: PersonInterface;
  driver?: PersonInterface;
  created_at: Date;
}
