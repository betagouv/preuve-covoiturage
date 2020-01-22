import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { PerSeatModifier } from './PerSeatModifier';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const test = new PerSeatModifier();

const trip = faker.trip([
  { seats: 0, is_driver: true },
  { seats: 5, is_driver: false },
]);

describe('Policy rule: per seat', () => {
  it('should multiply result by number of seat', async () => {
    const context = {
      trip,
      meta,
      stack: [],
      result: 10,
      person: trip.people[0],
    };
    await test.apply(context);
    expect(context.result).to.eq(10);

    const context2 = {
      trip,
      meta,
      stack: [],
      result: 10,
      person: trip.people[1],
    };
    await test.apply(context2);
    expect(context2.result).to.eq(50);
  });
});
