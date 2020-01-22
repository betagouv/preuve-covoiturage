import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { DistanceBoundingTransformer } from './DistanceBoundingTransformer';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const test = new DistanceBoundingTransformer({
  minimum: 1000,
  maximum: 10000,
});

const trip = faker.trip([{ distance: 100 }, { distance: 20000 }]);

describe('Policy rule: distance bounding transformer', () => {
  it('should update distance to minimum if result < min', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 1,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.person.distance).to.eq(1000);
  });

  it('should updte distance to maximum if result > max', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 1,
      person: trip.people[1],
    };
    await test.apply(context);
    expect(context.person.distance).to.eq(10000);
  });
});
