// tslint:disable
import { mockDates } from '~/modules/stat/mocks/dates';
import { Stat } from '~/core/entities/stat/stat';

export const mockStatsData = {
  distance: {
    days: [...Array(100)].map(() => ~~(Math.random() * 500000)),
    months: [...Array(6)].map(() => ~~(Math.random() * 10000000)),
  },
  carpoolers: {
    days: [...Array(100)].map(() => ~~(Math.random() * 40)),
    months: [...Array(6)].map(() => ~~(Math.random() * 400)),
  },
  carpoolers_per_vehicule: {
    days: [...Array(100)].map(() => ~~(Math.random() * 2)),
  },
  trips: {
    days: [...Array(100)].map(() => ~~(Math.random() * 100)),
    months: [...Array(6)].map(() => ~~(Math.random() * 3000)),
  },
};

export const mockStats = <Stat>{
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
        date: mockDates.months[idx],
        total: val,
      };
    }),
  },
  carpoolers_per_vehicule: {
    total: 1.2,
    days: mockStatsData.carpoolers_per_vehicule.days.map((val, idx) => {
      return {
        date: mockDates.days[idx],
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
        date: mockDates.months[idx],
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
      };
    }),
    months: mockStatsData.trips.months.map((val, idx) => {
      return {
        date: mockDates.months[idx],
        total: val,
      };
    }),
  },
};
