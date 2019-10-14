// tslint:disable
import { mockDates } from './const/dates';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';

export class StatsGenerator {
  static get generateStats(): StatInterface[] {
    return mockDates.days.map((day: string) => ({
      day,
      carpoolers: ~~((Math.random() + 1) * 40),
      distance: ~~((Math.random() + 1) * 500000),
      trip: ~~((Math.random() + 1) * 100),
      trip_subsidized: ~~((Math.random() + 1) * 80),
    }));
  }
}
