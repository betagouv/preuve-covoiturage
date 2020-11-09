import random from 'lodash/random';
import fill from 'lodash/fill';
import sample from 'lodash/sample';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

type Params = {
  start: Date;
  end: Date;
  weekday: number;
  hours: {
    night: number;
    morning: number;
    lunch: number;
    afternoon: number;
    evening: number;
  };
};

enum HourEnum {
  Night = 'night',
  Morning = 'morning',
  Lunch = 'lunch',
  Afternoon = 'afternoon',
  Evening = 'evening',
}

function applyDefaults(params: Partial<Params>): Params {
  let end = new Date();
  end.setDate((params.start ? params.start.getDate() : new Date().getDate()) + 7);

  return {
    start: params.start || new Date(),
    end: params.end || end,
    weekday: params.weekday || 10,
    hours: params.hours || {
      night: 0,
      morning: 10,
      lunch: 0,
      afternoon: 0,
      evening: 0,
    },
  };
}

export class DatetimeVariant extends AbstractVariant<Partial<Params>> {
  readonly propertyPath: string = 'datetime';
  readonly params: Params;
  readonly hoursSet: HourEnum[];

  constructor(params: Partial<Params> = {}) {
    super(params);

    this.params = applyDefaults(params);

    if (
      // start should be before end
      this.params.end <= this.params.start ||
      // weekday should be between 0-10
      this.params.weekday > 10 ||
      this.params.weekday < 0 ||
      // Sum of hours should be 10
      Object.keys(this.params.hours)
        .map((k) => this.params.hours[k])
        .reduce((sum, i) => sum + i, 0) !== 10
    ) {
      throw new Error('Misconfigured variant');
    }

    this.hoursSet = new Array(10);
    Object.keys(this.params.hours).map((k) => {
      this.hoursSet.push(...fill(new Array(this.params.hours[k]), k));
    });
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    let datetime = this.getTime(this.getDate(random(0, 10) <= this.params.weekday), sample(this.hoursSet));
    return people.map((p) => {
      return {
        ...p,
        [this.propertyPath]: datetime,
      };
    });
  }

  protected getDate(wk: boolean): Date {
    function isOk(weekday: boolean, date: Date): boolean {
      let isWeekDay = date.getDay() > 0 && date.getDay() < 6;
      return weekday ? isWeekDay : !isWeekDay;
    }
    const days: number = (this.params.end.valueOf() - this.params.start.valueOf()) / 1000 / 60 / 60 / 24;
    let date = new Date();
    do {
      const diff = random(0, days);
      date.setDate(this.params.start.getDate() + diff);
    } while (!isOk(wk, date));

    return date;
  }

  protected getTime(date: Date, period: HourEnum): Date {
    switch (period) {
      case HourEnum.Night:
        date.setHours(random(0, 5), 0, 0, 0);
        break;
      case HourEnum.Morning:
        date.setHours(random(5, 11), 0, 0, 0);
        break;
      case HourEnum.Lunch:
        date.setHours(random(11, 15), 0, 0, 0);
        break;
      case HourEnum.Afternoon:
        date.setHours(random(15, 20), 0, 0, 0);
        break;
      case HourEnum.Evening:
        date.setHours(random(20, 23), 0, 0, 0);
        break;
      default:
        break;
    }
    return date;
  }
}
