import { IdentityInterface } from '../../identity';
import { PositionInterface } from '../../position';
import { IncentiveInterface } from '../../incentive';
import { PaymentInterface } from '../../payment';

export interface PersonInterface {
  is_driver?: boolean;
  identity: IdentityInterface;
  operator_class?: string;
  journey_id?: string;
  operator_id?: string;

  start: PositionInterface;
  end: PositionInterface;
  distance?: number;
  duration?: number;

  seats?: number;
  contribution?: number;
  revenue?: number;
  expense: number;
  incentives?: IncentiveInterface[];

  payments?: PaymentInterface[];
}
