import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { inseeBlacklistFilter, inseeWhitelistFilter } from './inseeFilter';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';
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
    const apply = inseeBlacklistFilter.apply([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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
    ).to.eventually.rejectedWith(NotApplicableTargetException, inseeBlacklistFilter.description);
  });

  it('should do nothing if start and end is in blacklist with AND operator', () => {
    const apply = inseeBlacklistFilter.apply([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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

  it('should throw error if start or end is in blacklist with OR operator', () => {
    const apply = inseeBlacklistFilter.apply([{ start: ['A'], end: [] }, { start: [], end: ['A'] }]);

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
    ).to.eventually.rejectedWith(NotApplicableTargetException, inseeBlacklistFilter.description);
  });

  it('should throw error if start and end is in whitelist with AND operator', () => {
    const apply = inseeWhitelistFilter.apply([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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
    ).to.eventually.rejectedWith(NotApplicableTargetException, inseeWhitelistFilter.description);
  });

  it('should do nothing if start and end is in whitelist with AND operator', () => {
    const apply = inseeWhitelistFilter.apply([
      {
        start: ['A'],
        end: ['A'],
      },
    ]);

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

  it('should do nothin if start or end is in whitelist with OR operator', () => {
    const apply = inseeWhitelistFilter.apply([{ start: ['A'], end: [] }, { start: [], end: ['A'] }]);

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
