import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { AdultOnlyFilter } from './AdultOnlyFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new AdultOnlyFilter();

const trip = faker.trip([{ is_over_18: false }, { is_over_18: true }]);

describe('Policy rule: adult only filter', () => {
  it('should throw error if person is not adult', () => {
    return expect(
      test.filter({
        trip,
        meta,
        stack: [],
        person: trip.people[0],
      }),
    ).to.eventually.rejectedWith(NotApplicableTargetException, AdultOnlyFilter.description);
  });

  it('should do nothing if person is adult', () => {
    return expect(
      test.filter({
        trip,
        meta,
        stack: [],
        person: trip.people[1],
      }),
    ).to.eventually.fulfilled;
  });
});
