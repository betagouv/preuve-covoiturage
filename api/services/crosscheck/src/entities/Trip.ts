/* tslint:disable:max-classes-per-file, variable-name*/
import { PersonInterface, TripInterface } from '../interfaces/TripInterface';
import { PositionInterface } from '../interfaces/PositionInterface';
import { IdentityInterface, IncentiveInterface } from '../interfaces/JourneyInterface';
import { PaymentInterface } from '../interfaces/PaymentInterface';

export class Trip implements TripInterface {
  public _id?: string;
  public territories?: string[];
  public status: string;
  public start: Date;
  public people: PersonInterface[];
  public deletedAt?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
  constructor(data: { _id?: string; territories?: string[]; status: string; start: Date; people: PersonInterface[] }) {
    this._id = data._id;
    this.territories = data.territories;
    this.status = data.status;
    this.start = data.start;
    this.people = data.people;
  }
}

export class Person implements PersonInterface {
  public journey_id: string;
  public operator_journey_id: string;
  public operator_id: string;
  public operator_class: string;
  public class: string;

  public is_driver: boolean;
  public identity: IdentityInterface;

  public start: PositionInterface;
  public end: PositionInterface;
  public distance?: number;
  public duration?: number;

  public seats?: number;
  public cost: number;
  public incentive?: number;
  public remaining_fee: number;
  public contribution?: number;
  public revenue?: number;
  public expense: number;
  public incentives?: IncentiveInterface[];
  public payments?: PaymentInterface[];

  public validation?: {
    step: number;
    validated: boolean;
    validatedAt: Date;
    tests: any;
    rank: string;
  };

  constructor(data: PersonInterface) {
    this.journey_id = data.journey_id;
    this.operator_class = data.operator_class;
    this.operator_journey_id = data.operator_journey_id;
    this.operator_id = data.operator_id;

    this.class = data.class;
    this.is_driver = data.is_driver;

    this.identity = data.identity;

    this.start = data.start;
    this.end = data.end;
    this.distance = data.distance;
    this.duration = data.duration;

    this.seats = data.seats;
    this.cost = data.cost;
    this.revenue = data.revenue;
    this.expense = data.expense;
    this.remaining_fee = data.remaining_fee;
    this.contribution = data.contribution;
    this.incentives = data.incentives;
    this.payments = data.payments;

    this.validation = data.validation;
  }
}
