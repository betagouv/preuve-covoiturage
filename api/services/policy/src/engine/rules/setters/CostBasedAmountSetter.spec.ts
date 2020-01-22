import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { CostBasedAmountSetter } from './CostBasedAmountSetter';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const test = new CostBasedAmountSetter();

const trip = faker.trip([{ cost: 10 }, { cost: -10 }]);

describe('Policy rule: cost based amount', () => {
  it('should replace result by cost', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 0,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.result).to.eq(trip.people[0].cost);

    const context2 = {
      trip,
      meta,
      stack: [],
      result: 0,
      person: trip.people[1],
    };
    await test.apply(context2);
    expect(context2.result).to.eq(Math.abs(trip.people[1].cost));
  });
});
