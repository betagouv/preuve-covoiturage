import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { operatorWhitelistFilter } from './operatorWhitelistFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';
import { faker } from '../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = operatorWhitelistFilter.apply([1]);
const trip = faker.trip([{ operator_id: 1 }, { operator_id: 2 }]);

describe('Policy rule: operator filter', () => {
  it('should throw error if operator out of whitelist', () => {
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
    ).to.eventually.rejectedWith(NotApplicableTargetException, operatorWhitelistFilter.description);
  });

  it('should do nothing if operator in whitelist', () => {
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
