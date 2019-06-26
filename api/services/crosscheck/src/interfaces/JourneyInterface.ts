import {PositionInterface} from './PositionInterface';

export interface JourneyInterface {
  _id: string;
  journey_id: string;
  operator_journey_id: string;
  operator_class?: string;
  operator: {
    _id: string;
    name: string;
  };
  passenger?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    seats: number;
    contribution: number;
    distance?: number;
    duration?: number;
    cost: number;
    incentive: number;
    remaining_fee: number;
  };
  driver?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    expense: number;
    revenue: number;
    distance?: number;
    duration?: number;
    cost: number;
    incentive: number;
    remaining_fee: number;
  };
  territory?: string[];
}

export interface PassengerInterface {
  identity: IdentityInterface;
  start: PositionInterface;
  end: PositionInterface;
  seats: number;
  contribution: number;
  distance?: number;
  duration?: number;
  cost: number;
  incentive: number;
  remaining_fee: number;
  territory?: string[];
}

export interface DriverInterface {
  expense: number;
  identity: IdentityInterface;
  start: PositionInterface;
  end: PositionInterface;
  revenue: number;
  distance?: number;
  duration?: number;
  cost: number;
  incentive: number;
  remaining_fee: number;
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

