import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { perSeatModifier } from './perSeatModifier';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const apply = perSeatModifier.apply(true);

const trip = faker.trip([{ seats: 0, is_driver: true }, { seats: 5, is_driver: false }]);

describe('Policy rule: per seat', () => {
  it('should multiply result by number of seat', async () => {
    const context = {
      result: 10,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(context, async () => {});
    expect(context.result).to.eq(10);

    const context2 = {
      result: 10,
      person: trip.people[1],
      trip,
      meta,
    };
    await apply(context2, async () => {});
    expect(context2.result).to.eq(50);
  });
});
