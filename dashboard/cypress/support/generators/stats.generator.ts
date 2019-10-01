// tslint:disable
import { mockDates } from './const/dates';
import { Stat } from '../../../src/app/core/entities/stat/stat';

export const mockStatsData = {
  distance: {
    days: [...Array(mockDates.days.length)].map(() => ~~(Math.random() * 500000)),
    months: [...Array(mockDates.months.length)].map(() => ~~(Math.random() * 10000000)),
  },
  carpoolers: {
    days: [...Array(mockDates.days.length)].map(() => ~~(Math.random() * 40)),
    months: [...Array(mockDates.months.length)].map(() => ~~(Math.random() * 400)),
  },
  carpoolers_per_vehicule: {
    days: [...Array(mockDates.days.length)].map((val, idx) => (Math.random() * idx) / 50 + 2),
    months: [...Array(mockDates.months.length)].map((val, idx) => (Math.random() * idx) / 50 + 2),
  },
  trips: {
    days: [...Array(mockDates.days.length)].map(() => ~~(Math.random() * 100)),
    months: [...Array(mockDates.months.length)].map(() => ~~(Math.random() * 3000)),
  },
};

export class StatsGenerator {
  static get generateStats(): Stat {
    return {
      _id: 'randomStatId',
      carpoolers: {
        total: 5678,
        days: mockStatsData.carpoolers.days.map((val, idx) => {
          return {
            date: mockDates.days[idx],
            total: val,
          };
        }),
        months: mockStatsData.carpoolers.months.map((val, idx) => {
          return {
            day: mockDates.months[idx],
            total: val,
          };
        }),
      },
      carpoolers_per_vehicule: {
        total: 2.5,
        days: mockStatsData.carpoolers_per_vehicule.days.map((val, idx) => {
          return {
            date: mockDates.days[idx],
            total: val,
          };
        }),
        months: mockStatsData.carpoolers_per_vehicule.months.map((val, idx) => {
          return {
            day: mockDates.months[idx],
            total: val,
          };
        }),
      },
      distance: {
        total: 1000780000,
        days: mockStatsData.distance.days.map((val, idx) => {
          return {
            date: mockDates.days[idx],
            total: val,
          };
        }),
        months: mockStatsData.distance.months.map((val, idx) => {
          return {
            day: mockDates.months[idx],
            total: val,
          };
        }),
      },
      operators: {
        total: 5,
        imgIds: [],
      },
      trips: {
        total: 68008,
        total_subsidized: 62000,
        days: mockStatsData.trips.days.map((val, idx) => {
          return {
            date: mockDates.days[idx],
            total: val,
            total_subsidized: val / 2,
          };
        }),
        months: mockStatsData.trips.months.map((val, idx) => {
          return {
            day: mockDates.months[idx],
            total: val,
            total_subsidized: val / 2,
          };
        }),
      },
    };
  }
}
