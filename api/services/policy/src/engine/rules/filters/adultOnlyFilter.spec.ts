import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { adultOnlyFilter } from './adultOnlyFilter';
import { NotApplicableTargetException } from '../../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = adultOnlyFilter.apply(true);

const trip = faker.trip([{ is_over_18: false }, { is_over_18: true }]);

describe('Policy rule: adult only filter', () => {
  it('should throw error if person is not adult', () => {
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
    ).to.eventually.rejectedWith(NotApplicableTargetException, adultOnlyFilter.description);
  });

  it('should do nothing if person is adult', () => {
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
