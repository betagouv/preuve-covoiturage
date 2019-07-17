import { IdentityInterface } from '../../identity';
import { IncentiveInterface } from '../../incentive';
import { PaymentInterface } from '../../payment';
import { PositionInterface } from '../../position';
import { PersonInterface } from '../../person';

export interface CreateJourneyParamsInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class?: string;
  operator_id: string;
  passenger?: PersonInterface;
  driver?: PersonInterface;
}
