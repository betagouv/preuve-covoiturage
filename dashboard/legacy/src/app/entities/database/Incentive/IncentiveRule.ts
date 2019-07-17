/* tslint:disable:variable-name*/

export class IncentiveRule {
  weekday: number[];
  time: [IncentiveTimeFilter];
  range: { min: number; max: number };
  minRank: number;

  constructor(obj?: any) {
    this.weekday = (obj && obj.weekday) || null;
    this.time = (obj && obj.time) || null;
    this.range = (obj && obj.range) || null;
    this.minRank = (obj && obj.minRank) || null;
  }
}

class IncentiveTimeFilter {
  start: Date;
  end: Date;

  constructor(obj?: any) {
    this.start = (obj && obj.start) || null;
    this.end = (obj && obj.end) || null;
  }
}
