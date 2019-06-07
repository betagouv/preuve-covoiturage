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
  travel_pass?: {
    name: string;
    user_id: string;
  };
  over_18?: boolean;
}

export interface CreateJourneyParamsInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class?: string;
  passenger?: {
    identity: IdentityInterface,
    start: PositionInterface,
    end: PositionInterface,
    seats: number,
    contribution: number,
    distance?: number,
    duration?: number,
  };
  driver?: {
    identity: IdentityInterface,
    start: PositionInterface,
    end: PositionInterface,
    revenue: number,
    distance?: number,
    duration?: number,
  };
}

export interface JourneyInterface {
  journey_id: string;
  operator_journey_id: string;
  operator_class?: string;
  operator: {
    _id: string,
    name: string,
  };
  passenger?: {
    identity: IdentityInterface,
    start: PositionInterface,
    end: PositionInterface,
    seats: number,
    contribution: number,
    distance?: number,
    duration?: number,
    cost: number,
    incentive: number,
    remaining_fee: number,
  };
  driver?: {
    identity: IdentityInterface,
    start: PositionInterface,
    end: PositionInterface,
    expense: number,
    revenue: number,
    distance?: number,
    duration?: number,
    cost: number,
    incentive: number,
    remaining_fee: number,
  };
}
