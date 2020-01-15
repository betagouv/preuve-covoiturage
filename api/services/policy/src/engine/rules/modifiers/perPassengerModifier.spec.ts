import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { perPassengerModifier } from './perPassengerModifier';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const apply = perPassengerModifier.apply(true);

const trip = faker.trip([{ seats: 10, is_driver: true }, { seats: 5, is_driver: false }]);

describe('Policy rule: per passenger', () => {
  it('should multiply result by number of passenger', async () => {
    const context = {
      result: 1,
      person: trip.people[0],
      trip,
      meta,
    };
    await apply(context, async () => {});
    expect(context.result).to.eq(trip.people[1].seats);
  });
});
