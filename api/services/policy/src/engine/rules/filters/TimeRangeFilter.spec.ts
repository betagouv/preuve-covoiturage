import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { TimeRangeFilter } from './TimeRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new TimeRangeFilter([
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

const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

describe('Policy rule: time filter', () => {
  it('should throw error if out of range', () => {
    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, TimeRangeFilter.description);
  });

  it('should do nothing if in range', () => {
    return expect(
      test.filter(
        {

          person: trip.people[0],
          trip,
          meta,
        },

      ),
    ).to.eventually.fulfilled;
  });
});
