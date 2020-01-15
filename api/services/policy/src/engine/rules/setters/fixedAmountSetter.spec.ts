import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { fixedAmountSetter } from './fixedAmountSetter';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const amount = 1000;
const apply = fixedAmountSetter.apply(amount);
const trip = faker.trip([{}]);

describe('Policy rule: fixed amount', () => {
  it('should replace result by fixed amount', async () => {
    const context = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(context, async () => {});
    expect(context.result).to.eq(amount);
  });
});
