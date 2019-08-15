import { CarUser } from './carUser';
import { Position } from './position';

export class CarUserJourney {
  public _id: number;
  public identity: CarUser;
  public start: Position;
  public end: Position;
  public cost: number;
  public distance: number;
  public duration: number;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.identity = (obj && obj.identity) || null;
    this.start = (obj && obj.start) || new Position();
    this.end = (obj && obj.end) || new Position();
    this.cost = (obj && obj.cost) || null;
    this.distance = (obj && obj.distance) || null;
    this.duration = (obj && obj.duration) || null;
  }
}
