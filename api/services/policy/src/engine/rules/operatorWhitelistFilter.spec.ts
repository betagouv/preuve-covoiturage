import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { operatorWhitelistFilter } from './operatorWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = operatorWhitelistFilter.apply([1]);

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
      operator_class: 'A',
      operator_id: 2,

      start: {
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
describe('Policy rule: operator filter', () => {
  it('should throw error if operator out of whitelist', () => {
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
    ).to.eventually.rejectedWith(NotApplicableTargetException, operatorWhitelistFilter.description);
  });

  it('should do nothing if operator in whitelist', () => {
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
