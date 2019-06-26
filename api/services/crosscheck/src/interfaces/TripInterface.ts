import {PositionInterface} from './PositionInterface';

export interface TripInterface {
  _id?: string;
  operator_id: string;
  operator_journey_id?: string;
  territory?: string[];
  status: string;
  start: Date;
  people: PersonInterface[];
  incentives?: IncentiveInterface[];
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PersonInterface {
  journey_id: string;
  class: string;
  operator_class: string;
  operator: {
    _id: string;
    name: string;
  };
  is_driver: boolean;
  identity: IdentityInterface;

  start: PositionInterface;
  end: PositionInterface;
  distance?: number;
  duration?: number;

  seats?: number;
  cost?: number;
  incentive?: number;
  remaining_fee?: number;
  contribution?: number;
  revenue?: number;
  expense?: number;

  validation?: {
    step: number;
    validated: boolean;
    validatedAt: Date;
    tests: any;
    rank: string;
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
