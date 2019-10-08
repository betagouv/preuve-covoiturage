import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { maxTripPerTargetRestriction } from './maxTripPerTargetRestriction';
import { TripInterface } from '@pdc/provider-schema';
import { compose } from '../helpers/compose';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';

const meta = new MetadataWrapper('test', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = compose([
  maxTripPerTargetRestriction.apply({
    target: 'driver',
    amount: 1,
    period: 'day',
  }),
  async (ctx) => {
    ctx.result = 10;
  },
]);

const trip: TripInterface = {
  operator_id: ['operatorA'],
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
      operator_id: 'operatorA',

      start: {
        datetime: new Date(),
        // lat?: number;
        // lon?: number;
        insee: 'A',
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
        insee: 'A',
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
      operator_id: 'operatorA',

      start: {
        datetime: new Date(),
        // lat?: number;
        // lon?: number;
        insee: 'B',
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
        insee: 'A',
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
describe('Policy rule: max trip per target', () => {
  it('should increase meta data', async () => {
    const data = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(data, async () => {});
    const datetime = trip.people[0].start.datetime;
    const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
    expect(
      meta.get(
        `${maxTripPerTargetRestriction.slug}.${trip.people[0].identity.phone}.day.${day}-${month}-${year}`,
        null,
      ),
    ).to.eq(1);
  });

  it('should raise error if limit is reached', () => {
    const data = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    return expect(apply(data)).to.eventually.rejectedWith(
      NotApplicableTargetException,
      maxTripPerTargetRestriction.description,
    );
  });
});
