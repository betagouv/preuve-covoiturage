import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { FixedAmountSetter } from './FixedAmountSetter';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const amount = 1000;
const test = new FixedAmountSetter(amount);
const trip = faker.trip([{}]);

describe('Policy rule: fixed amount', () => {
  it('should replace result by fixed amount', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 0,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.result).to.eq(amount);
  });
});
