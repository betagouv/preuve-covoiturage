// tslint:disable: variable-name

import { JourneyInterface } from '../interfaces/JourneyInterfaces';
import { IdentityInterface } from '../interfaces/IdentityInterface';
import { PositionInterface } from '../interfaces/PositionInterface';
import { IncentiveInterface } from '../interfaces/IncentiveInterface';
import { PaymentInterface } from '../interfaces/PaymentInterface';

export class Journey implements JourneyInterface {
  public _id?: string;
  public journey_id: string;
  public operator_journey_id: string;
  public operator_class?: string;
  public operator_id: string;
  public passenger?: {
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
  public driver?: {
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

  constructor(data: JourneyInterface) {
    if ('_id' in data) {
      this._id = data._id;
    }

    this.journey_id = data.journey_id;
    this.operator_journey_id = data.operator_journey_id;
    this.operator_class = data.operator_class;
    this.operator_id = data.operator_id;
    this.passenger = data.passenger;
    this.driver = data.driver;
  }
}
