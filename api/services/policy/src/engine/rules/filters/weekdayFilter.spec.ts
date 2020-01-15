import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { weekdayFilter } from './weekdayFilter';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const startInRange = new Date();
const apply = weekdayFilter.apply([startInRange.getDay()]);

const startOutRange = new Date();
startOutRange.setDate(startOutRange.getDate() + 1);

const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

describe('Policy rule: weekday filter', () => {
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
    ).to.eventually.rejectedWith(NotApplicableTargetException, weekdayFilter.description);
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
