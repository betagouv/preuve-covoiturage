import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { costBasedAmountSetter } from './costBasedAmountSetter';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const apply = costBasedAmountSetter.apply(true);

const trip = faker.trip([{ cost: 10 }, { cost: -10 }]);

describe('Policy rule: cost based amount', () => {
  it('should replace result by cost', async () => {
    const context = {
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(context, async () => {});
    expect(context.result).to.eq(trip.people[0].cost);

    const context2 = {
      result: 0,
      person: trip.people[1],
      trip,
      meta,
    };
    await apply(context2, async () => {});
    expect(context2.result).to.eq(Math.abs(trip.people[1].cost));
  });
});
