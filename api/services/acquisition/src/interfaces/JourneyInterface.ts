import { IdentityInterface, PositionInterface, IncentiveInterface, PaymentInterface } from '.';

export interface JourneyInterface {
  _id?: string;
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
