/* tslint:disable:variable-name*/
import { User } from './user/user';
import { Operator } from './operator';
import { Validation } from './validation';
import { CarUserJourney } from './carUserJourney';
import { Position } from './position';

export class Journey {
  public _id: number;
  public identity: User;
  public operator: Operator;
  public start: Position;
  public end: Position;
  public cost: number;
  public distance: number;
  public duration: number;
  public operator_class: string;
  public journey_id: number;
  public passengers: [CarUserJourney];
  public driver: CarUserJourney;
  public validation: Validation;
  public createdAt: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.identity = (obj && obj.identity) || null;
    this.start = (obj && obj.start) || new Position();
    this.end = (obj && obj.end) || new Position();
    this.cost = (obj && obj.cost) || null;
    this.distance = (obj && obj.distance) || null;
    this.duration = (obj && obj.duration) || null;
    this.operator = (obj && obj.operator) || new Operator();
    this.operator_class = (obj && obj.operator_class) || null;
    this.journey_id = (obj && obj.journey_id) || null;
    this.passengers = (obj && obj.passengers) || null;
    this.createdAt = (obj && obj.createdAt) || null;
  }
}
