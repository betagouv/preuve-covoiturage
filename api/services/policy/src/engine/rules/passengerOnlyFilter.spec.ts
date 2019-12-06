import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { passengerOnlyFilter } from './passengerOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';
import { faker } from '../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = passengerOnlyFilter.apply(true);

const trip = faker.trip([{ is_driver: true }, { is_driver: false }]);

describe('Policy rule: passenger only filter', () => {
  it('should throw error if person is not passenger', () => {
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
    ).to.eventually.rejectedWith(NotApplicableTargetException, passengerOnlyFilter.description);
  });

  it('should do nothing if person is passenger', () => {
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
    ).to.eventually.fulfilled;
  });
});
