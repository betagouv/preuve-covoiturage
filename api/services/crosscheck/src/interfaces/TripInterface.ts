import { PositionInterface } from './PositionInterface';
import { IdentityInterface, IncentiveInterface } from './JourneyInterface';
import { PaymentInterface } from './PaymentInterface';

export interface TripInterface {
  _id?: string;
  territory?: string[];
  status: string;
  start: Date;
  people: PersonInterface[];
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PersonInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class: string;
  operator_id: string;
  class: string;

  is_driver: boolean;
  identity: IdentityInterface;

  start: PositionInterface;
  end: PositionInterface;
  distance?: number;
  duration?: number;

  seats?: number;
  cost?: number;
  remaining_fee?: number;
  contribution?: number;
  revenue?: number;
  expense?: number;
  incentives?: IncentiveInterface[];
  payments?: PaymentInterface[];

  validation?: {
    step: number;
    validated: boolean;
    validatedAt: Date;
    tests: any;
    rank: string;
  };
}
