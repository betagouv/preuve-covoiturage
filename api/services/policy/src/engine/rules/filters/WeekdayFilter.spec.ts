import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { WeekdayFilter } from './WeekdayFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const startInRange = new Date();
const test = new WeekdayFilter([startInRange.getDay()]);

const startOutRange = new Date();
startOutRange.setDate(startOutRange.getDate() + 1);

const trip = faker.trip([{ datetime: startInRange }, { datetime: startOutRange }]);

describe('Policy rule: weekday filter', () => {
  it('should throw error if out of range', () => {
    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, WeekdayFilter.description);
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
