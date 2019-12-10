import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { timeRangeFilter } from './timeRangeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';
import { faker } from '../helpers/faker';

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

const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

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
