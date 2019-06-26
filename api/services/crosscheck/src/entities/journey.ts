/* tslint:disable:variable-name*/
import {DriverInterface, IdentityInterface, JourneyInterface, PassengerInterface} from '../interfaces/JourneyInterface';
import { PositionInterface } from '../interfaces/PositionInterface';

export class Journey implements JourneyInterface {
  public _id: string;
  public journey_id: string;
  public operator_journey_id: string;
  public operator_class?: string;
  public operator: {
    _id: string;
    name: string;
  };
  public passenger?: PassengerInterface;
  public driver?: DriverInterface;
  public territory?: string[];

  constructor(data: JourneyInterface) {
    this._id = data._id;
    this.operator = data.operator;
    this.journey_id = data.journey_id;
    this.operator_journey_id = data.operator_journey_id;
    this.operator_class = data.operator_class;
    this.passenger = data.passenger;
    this.driver = data.driver;
    this.territory = data.territory;
  }
}
