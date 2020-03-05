import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { BoundedModifier } from './BoundedModifier';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const test = new BoundedModifier({
  minimum: 10,
  maximum: 100,
});

const trip = faker.trip([{ distance: 10000 }, { distance: 20000 }]);

describe('Policy rule: bounded modifier', () => {
  it('should return minimum if result < min', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 1,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.result).to.eq(10);
  });

  it('should return maximum if result > max', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 1000,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.result).to.eq(100);
  });
});
