import { JourneyInterface, IdentityInterface, PositionInterface } from '../interfaces/JourneyInterfaces';

export class Journey implements JourneyInterface {
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
    expense: number,
    identity: IdentityInterface,
    start: PositionInterface,
    end: PositionInterface,
    revenue: number,
    distance?: number,
    duration?: number,
    cost: number,
    incentive: number,
    remaining_fee: number,
  };

  constructor(data: JourneyInterface) {
    this.journey_id = data.journey_id;
    this.operator_journey_id = data.operator_journey_id;
    this.operator_class = data.operator_class;
    this.passenger = data.passenger;
    this.driver = data.driver;
  }
}
