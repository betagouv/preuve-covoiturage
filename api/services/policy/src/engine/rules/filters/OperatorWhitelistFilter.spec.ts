import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { OperatorWhitelistFilter } from './OperatorWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new OperatorWhitelistFilter([1]);
const trip = faker.trip([{ operator_id: 1 }, { operator_id: 2 }]);

describe('Policy rule: operator filter', () => {
  it('should throw error if operator out of whitelist', () => {
    return expect(
      test.filter(
        {

          person: trip.people[1],
          trip,
          meta,
        },

      ),
    ).to.eventually.rejectedWith(NotApplicableTargetException, OperatorWhitelistFilter.description);
  });

  it('should do nothing if operator in whitelist', () => {
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
