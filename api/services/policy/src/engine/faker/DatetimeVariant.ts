import random from 'lodash/random';
import moment from 'moment';
import fill from 'lodash/fill';
import sample from 'lodash/sample';

import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

type Params<D = Date> = {
  start: D;
  end: D;
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

function applyDefaults(params: Partial<Params>): Params<moment.Moment> {
  const end = new Date();
  end.setDate((params.start ? params.start.getDate() : new Date().getDate()) + 7);

  return {
    start: moment(params.start || new Date()),
    end: moment(params.end || end),
    weekday: params.weekday || 5,
    hours: params.hours || {
      night: 1,
      morning: 4,
      lunch: 1,
      afternoon: 3,
      evening: 1,
    },
  };
}

export class DatetimeVariant extends AbstractVariant<Partial<Params<moment.Moment>>> {
  readonly propertyPath: string = 'datetime';
  readonly params: Params<moment.Moment>;
  readonly hoursSet: HourEnum[];

  constructor(params: Partial<Params> = {}) {
    super(applyDefaults(params));

    this.params = applyDefaults(params);
    if (this.params.end.isBefore(this.params.start)) {
      throw new Error('Misconfigured variant : end should be after start');
    }

    if (this.params.end.diff(this.params.start, 'days') < 7) {
      throw new Error('Misconfigured variant: end - start should be at least 7 days');
    }

    if (this.params.weekday > 9 || this.params.weekday < 1) {
      throw new Error('Misconfigured variant: weekday should be between 1 and 9');
    }

    if (
      Object.keys(this.params.hours)
        .map((k) => this.params.hours[k])
        .reduce((sum, i) => sum + i, 0) !== 10
    ) {
      throw new Error('Misconfigured variant: sum of hours should be equal to 10');
    }

    this.hoursSet = [];
    Object.keys(this.params.hours).map((k) => {
      this.hoursSet.push(...fill(new Array(this.params.hours[k]), k));
    });
  }

  public generate(people: PersonInterface[]): PersonInterface[] {
    const datetime = this.getTime(this.getDate(random(0, 10) <= this.params.weekday), sample(this.hoursSet));
    return people.map((p) => {
      return {
        ...p,
        [this.propertyPath]: datetime.toDate(),
      };
    });
  }

  protected getDate(wk: boolean): moment.Moment {
    function isOk(weekday: boolean, date: moment.Moment): boolean {
      const isWeekDay = date.day() > 0 && date.day() < 6;
      return weekday ? isWeekDay : !isWeekDay;
    }
    const days: number = this.params.end.diff(this.params.start, 'days');
    let date: moment.Moment;
    do {
      date = moment(this.params.start);
      const diff = random(0, days);
      date.add(diff, 'days');
    } while (!isOk(wk, date));
    return date;
  }

  protected getTime(date: moment.Moment, period: HourEnum): moment.Moment {
    switch (period) {
      case HourEnum.Night:
        date.hour(random(0, 5));
        break;
      case HourEnum.Morning:
        date.hour(random(5, 11));
        break;
      case HourEnum.Lunch:
        date.hour(random(11, 15));
        break;
      case HourEnum.Afternoon:
        date.hour(random(15, 20));
        break;
      case HourEnum.Evening:
        date.hour(random(20, 23));
        break;
      default:
        break;
    }
    date.minute(0);
    date.second(0);
    date.millisecond(0);
    return date;
  }
}
