import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { PerKmModifier } from './PerKmModifier';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const test = new PerKmModifier();

const trip = faker.trip([{ distance: 10000 }, { distance: 20000 }]);

describe('Policy rule: per km', () => {
  it('should multiply result by distance in km', async () => {
    const context = {
      result: 1,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(trip.people[0].distance / 1000);
  });
});
