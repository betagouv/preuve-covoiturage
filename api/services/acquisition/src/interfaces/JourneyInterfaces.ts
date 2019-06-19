export interface PositionInterface {
  datetime: string;
  lat?: number;
  lon?: number;
  insee?: string;
  literal?: string;
}

export interface IdentityInterface {
  phone: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  travelPass?: {
    name: string;
    userId: string;
  };
  over18?: boolean;
}

export interface CreateJourneyParamsInterface {
  journeyId: string;
  operatorJourneyId: string;
  operatorClass?: string;
  passenger?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    seats: number;
    contribution: number;
    distance?: number;
    duration?: number;
  };
  driver?: {
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    revenue: number;
    distance?: number;
    duration?: number;
  };
}

export interface JourneyInterface {
  _id?: string;
  journeyId: string;
  operatorJourneyId: string;
  operatorClass?: string;
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
    remainingFee: number;
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
    remainingFee: number;
  };
}
