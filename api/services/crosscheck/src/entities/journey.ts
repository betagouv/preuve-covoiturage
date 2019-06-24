import { IdentityInterface, JourneyInterface } from '../interfaces/JourneyInterface';
import { PositionInterface } from '../interfaces/PositionInterface';

export class Journey implements JourneyInterface {
  public _id: string;
  public journeyId: string;
  public operatorJourneyId: string;
  public operatorClass?: string;
  public operator: {
    _id: string;
    name: string;
  };
  public passenger?: {
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
  public driver?: {
    expense: number;
    identity: IdentityInterface;
    start: PositionInterface;
    end: PositionInterface;
    revenue: number;
    distance?: number;
    duration?: number;
    cost: number;
    incentive: number;
    remainingFee: number;
  };

  constructor(data: JourneyInterface) {
    this._id = data._id;
    this.operator = data.operator;
    this.journeyId = data.journeyId;
    this.operatorJourneyId = data.operatorJourneyId;
    this.operatorClass = data.operatorClass;
    this.passenger = data.passenger;
    this.driver = data.driver;
  }
}
