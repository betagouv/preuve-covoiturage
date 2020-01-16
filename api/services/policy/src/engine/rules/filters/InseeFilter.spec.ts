import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { InseeBlacklistFilter, InseeWhitelistFilter } from './InseeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const trip = faker.trip([
  {
    is_driver: true,
    start_insee: 'A',
    end_insee: 'A',
  },
  {
    is_driver: false,
    start_insee: 'A',
    end_insee: 'B',
  },
]);

describe('Policy rule: insee white and black list', () => {
  it('should throw error if start and end is in blacklist with AND operator', () => {
    const test = new InseeBlacklistFilter([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

    return expect(
      test.filter(
        {

          person: trip.people[0],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, InseeBlacklistFilter.description);
  });

  it('should do nothing if start and end is in blacklist with AND operator', () => {
    const test = new InseeBlacklistFilter([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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

  it('should throw error if start or end is in blacklist with OR operator', () => {
    const test = new InseeBlacklistFilter([
      { start: ['A'], end: [] },
      { start: [], end: ['A'] }
    ]);

    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, InseeBlacklistFilter.description);
  });

  it('should throw error if start and end is in whitelist with AND operator', () => {
    const test = new InseeWhitelistFilter([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, InseeWhitelistFilter.description);
  });

  it('should do nothing if start and end is in whitelist with AND operator', () => {
    const test = new InseeWhitelistFilter([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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

  it('should do nothin if start or end is in whitelist with OR operator', () => {
    const test = new InseeWhitelistFilter([
      { start: ['A'], end: [] },
      { start: [], end: ['A'] },
    ]);

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
