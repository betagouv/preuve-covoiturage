import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { timeRangeFilter } from './timeRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = timeRangeFilter.apply([
  {
    start: 8,
    end: 10,
  },
  {
    start: 17,
    end: 20,
  },
]);

const startInRange = new Date();
startInRange.setHours(9);

const startOutRange = new Date();
startOutRange.setHours(12);

const trip = {
  operator_id: [1],
  status: '',
  start: new Date(),
  people: [
    {
      is_driver: true,
      identity: {
        phone: '0102030405',
        over_18: false,
      },
      operator_class: 'A',
      operator_id: 1,

      start: {
        datetime: startInRange,
        // lat?: number;
        // lon?: number;
        // insee?: string;
        // postcodes?: string[];
        // town?: string;
        // country?: string;
        // literal?: string;
        // territory?: string;
      },
      end: {
        datetime: new Date(),
        // lat?: number;
        // lon?: number;
        // insee?: string;
        // postcodes?: string[];
        // town?: string;
        // country?: string;
        // literal?: string;
        // territory?: string;
      },
      distance: 50,
      duration: 10000,
      seats: 0,
      contribution: 10,
      revenue: 0,
      expense: 0,
      incentives: [],
      payments: [],
      calc_distance: 0,
      calc_duration: 0,
    },
    {
      is_driver: false,
      identity: {
        phone: '0102030405',
        over_18: true,
      },
      operator_class: 'B',
      operator_id: 2,

      start: {
        datetime: startOutRange,
        // lat?: number;
        // lon?: number;
        // insee?: string;
        // postcodes?: string[];
        // town?: string;
        // country?: string;
        // literal?: string;
        // territory?: string;
      },
      end: {
        datetime: new Date(),
        // lat?: number;
        // lon?: number;
        // insee?: string;
        // postcodes?: string[];
        // town?: string;
        // country?: string;
        // literal?: string;
        // territory?: string;
      },
      distance: 10000,
      duration: 10000,
      seats: 0,
      contribution: 10,
      revenue: 0,
      expense: 0,
      incentives: [],
      payments: [],
      calc_distance: 0,
      calc_duration: 0,
    },
  ],
};
describe('Policy rule: time filter', () => {
  it('should throw error if out of range', () => {
    return expect(
      apply(
        {
          result: 0,
          person: trip.people[1],
          trip,
          meta,
        },
        async () => {},
      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, timeRangeFilter.description);
  });

  it('should do nothing if in range', () => {
    return expect(
      apply(
        {
          result: 0,
          person: trip.people[0],
          trip,
          meta,
        },
        async () => {},
      ),
    ).to.eventually.fulfilled;
  });
});
