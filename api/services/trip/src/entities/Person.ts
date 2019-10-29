import {
  PersonInterface,
  IdentityInterface,
  PositionInterface,
  IncentiveInterface,
  PaymentInterface,
} from '@pdc/provider-schema';

export class Person implements PersonInterface {
  // tslint:disable-next-line: variable-name
  public is_driver: boolean;
  public identity: IdentityInterface;

  public start: PositionInterface;
  public end: PositionInterface;
  public distance?: number;
  public duration?: number;

  public operator_class?: string;
  public journey_id?: string;
  public operator_id?: string;

  public seats?: number;
  public contribution?: number;
  public revenue?: number;
  public expense: number;
  public incentives?: IncentiveInterface[];
  public payments?: PaymentInterface[];

  constructor(data: PersonInterface) {
    this.is_driver = data.is_driver;

    this.identity = data.identity;

    this.start = data.start;
    this.end = data.end;
    this.distance = data.distance;
    this.duration = data.duration;

    this.seats = data.seats;
    this.revenue = data.revenue;
    this.expense = data.expense;
    this.contribution = data.contribution;
    this.incentives = data.incentives;
    this.payments = data.payments;

    this.operator_class = data.operator_class;
    this.journey_id = data.journey_id;
    this.operator_id = data.operator_id;
  }
}
