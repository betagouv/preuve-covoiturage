import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { DistanceRangeFilter } from './DistanceRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new DistanceRangeFilter({
  min: 10,
  max: 100,
});

const trip = faker.trip([{ distance: 50 }, { distance: 5000 }]);

describe('Policy rule: distance range filter', () => {
  it('should throw error if out of range', () => {
    return expect(
      test.filter({
        person: trip.people[1],
        trip,
        meta,
      }),
    ).to.eventually.rejectedWith(NotApplicableTargetException, DistanceRangeFilter.description);
  });

  it('should do nothing if in range', () => {
    return expect(
      test.filter({
        person: trip.people[0],
        trip,
        meta,
      }),
    ).to.eventually.fulfilled;
  });
});
