/* tslint:disable:variable-name, max-classes-per-file*/

export class Statistics {
  collected: StatisticGroup;
  distance: StatisticGroup;

  constructor(obj?: any) {
    this.collected = (obj && obj.collected) || {};
    this.distance = (obj && obj.distance) || {};
  }
}

export class StatisticGroup {
  day: Statistic[];
  dayOfWeek: Statistic[];
  month: Statistic[];
  total: Statistic[];

  constructor(obj?: any) {
    this.day = (obj && obj.day) || [];
    this.dayOfWeek = (obj && obj.dayOfWeek) || [];
    this.month = (obj && obj.month) || [];
    this.total = (obj && obj.total) || [];
  }
}

export class Statistic {
  total: number;
  _id: StatisticId;
  constructor(obj?: any) {
    this._id = (obj && obj._id) || {};
    this.total = (obj && obj.total) || null;
  }
}

export class StatisticId {
  name: string;
  year: number;
  week: number;
  month: number;
  day: number;
  constructor(obj?: any) {
    this.name = (obj && obj.name) || null;
    this.year = (obj && obj.year) || null;
    this.week = (obj && obj.week) || null;
    this.month = (obj && obj.month) || null;
    this.day = (obj && obj.day) || null;
  }
}
