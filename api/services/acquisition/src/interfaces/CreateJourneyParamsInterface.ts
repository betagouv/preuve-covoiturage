import { IdentityInterface } from './IdentityInterface';
import { PositionInterface } from './PositionInterface';
import { IncentiveInterface } from './IncentiveInterface';
import { PaymentInterface } from './PaymentInterface';

export interface CreateJourneyParamsInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class?: string;
  operator_id: string;
  passenger?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    seats: number;
    contribution: number;
    expense: number;
    incentives: IncentiveInterface[];
    payments?: PaymentInterface[];
    distance?: number;
    duration?: number;
  };
  driver?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    revenue: number;
    expense: number;
    incentives: IncentiveInterface[];
    payments?: PaymentInterface[];
    distance?: number;
    duration?: number;
  };
}
