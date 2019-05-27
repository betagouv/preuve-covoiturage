/* tslint:disable:variable-name*/

import { Operator } from '~/entities/database/operator';
import { Validation } from '~/entities/database/validation';
import { Identity } from '~/entities/database/user/identity';

export class Person {
  journey_id: string;
  class: { A; B; C; Z };
  operator_class: { A; B; C; Z };
  operator: Operator;
  is_driver: boolean;
  identity: Identity;
  start: Position;
  end: Position;
  distance: number;
  duration: number;
  seats: number;
  cost: number;
  incentive: number;
  remaining_fee: number;
  contribution: number;
  revenue: number;
  expense: number;
  validation: Validation;

  constructor(obj?: any) {
    this.class = (obj && obj.class) || null;
    this.operator_class = (obj && obj.operator_class) || null;
    this.operator = (obj && obj.operator) || null;
    this.is_driver = (obj && obj.is_driver) || null;
    this.identity = (obj && obj.identity) || null;
    this.start = (obj && obj.start) || null;
    this.end = (obj && obj.end) || null;
    this.distance = (obj && obj.distance) || null;
    this.duration = (obj && obj.duration) || null;
    this.seats = (obj && obj.seats) || null;
    this.cost = (obj && obj.cost) || null;
    this.incentive = (obj && obj.incentive) || null;
    this.remaining_fee = (obj && obj.remaining_fee) || null;
    this.contribution = (obj && obj.contribution) || null;
    this.revenue = (obj && obj.revenue) || null;
    this.expense = (obj && obj.expense) || null;
    this.validation = (obj && obj.validation) || null;
  }
}
