import { PositionInterface } from './PositionInterface';
import { PaymentInterface } from './PaymentInterface';

export interface JourneyInterface {
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
    cost: number;
    remaining_fee: number;
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
    cost: number;
    expense: number;
    remaining_fee: number;
    incentives: IncentiveInterface[];
    payments?: PaymentInterface[];
    distance?: number;
    duration?: number;
  };
}

export interface IdentityInterface {
  phone: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  travel_pass?: {
    name: string;
    userId: string;
  };
  over18?: boolean;
}

export interface IncentiveInterface {
  incentive_id: string;
  distributor: string;
  status: string;
}
