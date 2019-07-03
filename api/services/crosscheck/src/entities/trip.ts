/* tslint:disable:max-classes-per-file, variable-name*/
import {IdentityInterface, IncentiveInterface, PersonInterface, TripInterface} from '../interfaces/TripInterface';
import {PositionInterface} from '../interfaces/PositionInterface';

export class Trip implements TripInterface {
  public _id?: string;
  public operator_id: string;
  public operator_journey_id?: string;
  public territory?: string[];
  public status: string;
  public start: Date;
  public people: PersonInterface[];
  public deletedAt?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
  constructor(data: {
    _id?: string;
    operator_id: string;
    operator_journey_id?: string;
    territory?: string[];
    status: string;
    start: Date;
    people: PersonInterface[];
  }) {
    this._id = data._id;
    this.operator_id = data.operator_id;
    this.operator_journey_id = data.operator_journey_id;
    this.territory = data.territory;
    this.status = data.status;
    this.start = data.start;
    this.people = data.people;
  }

}

export class Person implements PersonInterface {
  public journey_id: string;
  public class: string;
  public operator_class: string;
  public operator: {
    _id: string;
    name: string;
  };
  public is_driver: boolean;
  public identity: IdentityInterface;

  public start: PositionInterface;
  public end: PositionInterface;
  public distance?: number;
  public duration?: number;
  public territory: string[];

  public seats?: number;
  public cost: number;
  public incentive?: number;
  public remaining_fee: number;
  public contribution?: number;
  public revenue?: number;
  public expense: number;
  public incentives?: IncentiveInterface[];

  public validation?: {
    step: number;
    validated: boolean;
    validatedAt: Date;
    tests: any;
    rank: string;
  };
  constructor(data: {
    journey_id: string;
    class: string;
    operator_class: string;
    operator: {
      _id: string;
      name: string;
    };
    is_driver: boolean;
    identity: IdentityInterface;

    start: PositionInterface;
    end: PositionInterface;
    distance?: number;
    duration?: number;
    territory: string[];

    seats?: number;
    cost: number;
    incentive?: number;
    remaining_fee: number;
    contribution?: number;
    revenue?: number;
    expense: number;
    incentives?: IncentiveInterface[];

    validation?: {
      step: number;
      validated: boolean;
      validatedAt: Date;
      tests: any;
      rank: string;
    };
  }) {
    this.journey_id = data.journey_id;
    this.class = data.class;
    this.operator_class = data.operator_class;
    this.operator = data.operator;
    this.is_driver = data.is_driver;
    this.identity = data.identity;
    this.start = data.start;
    this.end = data.end;
    this.distance = data.distance;
    this.duration = data.duration;
    this.territory = data.territory;
    this.seats = data.seats;
    this.cost = data.cost;
    this.incentive = data.incentive;
    this.remaining_fee = data.remaining_fee;
    this.contribution = data.contribution;
    this.revenue = data.revenue;
    this.expense = data.expense;
    this.incentives = data.incentives;
    this.validation = data.validation;
  }
}
