import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { maxAmountPerTargetRestriction } from './maxAmountPerTargetRestriction';
import { compose } from '../helpers/compose';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../MetadataWrapper';
import { faker } from '../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = compose([
  maxAmountPerTargetRestriction.apply({
    target: 'driver',
    amount: 10,
    period: 'day',
  }),
  async (ctx) => {
    ctx.result = 10;
  },
]);
const uuid = 'uuid';

const trip = faker.trip([
  {
    is_driver: true,
    identity_uuid: uuid,
  },
]);

describe('Policy rule: max amout per target', () => {
  it('should increase meta data', async () => {
    const data = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(data, async () => {});
    const datetime = trip.people[0].datetime;
    const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
    expect(
      meta.get(
        `${maxAmountPerTargetRestriction.slug}.${trip.people[0].identity_uuid}.day.${day}-${month}-${year}`,
        null,
      ),
    ).to.eq(10);
  });

  it('should raise error if limit is reached', () => {
    const data = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    return expect(apply(data)).to.eventually.rejectedWith(
      NotApplicableTargetException,
      maxAmountPerTargetRestriction.description,
    );
  });
});
