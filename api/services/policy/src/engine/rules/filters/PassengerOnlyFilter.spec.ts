import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { PassengerOnlyFilter } from './PassengerOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new PassengerOnlyFilter();

const trip = faker.trip([{ is_driver: true }, { is_driver: false }]);

describe('Policy rule: passenger only filter', () => {
  it('should throw error if person is not passenger', () => {
    return expect(
      test.filter(
        {

          person: trip.people[0],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, PassengerOnlyFilter.description);
  });

  it('should do nothing if person is passenger', () => {
    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.fulfilled;
  });
});
