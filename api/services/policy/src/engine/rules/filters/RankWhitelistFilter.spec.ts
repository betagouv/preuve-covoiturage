import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { RankWhitelistFilter } from './RankWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new RankWhitelistFilter(['A']);

const trip = faker.trip([{ operator_class: 'A' }, { operator_class: 'B' }]);

describe('Policy rule: rank filter', () => {
  it('should throw error if rank out of whitelist', () => {
    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, RankWhitelistFilter.description);
  });

  it('should do nothing if rank in whitelist', () => {
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
