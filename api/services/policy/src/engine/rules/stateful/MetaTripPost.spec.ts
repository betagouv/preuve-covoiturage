import chai from 'chai';
import chaiAsync from 'chai-as-promised';

import { MetaTripPost } from './MetaTripPost';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';

chai.use(chaiAsync);
const { expect } = chai;

const uuid = 'uuid';

const trip = faker.trip([
  {
    is_driver: true,
    identity_uuid: uuid,
  },
]);

describe('Policy rule: max trip post processor', () => {
  it('should increase meta data per target', async () => {
    const meta = new MetadataWrapper(1, 'default', {});
    const test = new MetaTripPost({
      target: 'driver',
      period: 'day',
      prefix: 'toto',
    });

    const data = {
      trip,
      meta,
      stack: [],
      result: 10,
      person: trip.people[0],
    };
    await test.apply(data);
    const datetime = trip.people[0].datetime;
    const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
    expect(meta.get(`toto.${trip.people[0].identity_uuid}.day.${day}-${month}-${year}`, null)).to.eq(1);
  });
  it('should increase meta data global', async () => {
    const meta = new MetadataWrapper(1, 'default', {});

    const test = new MetaTripPost({
      period: 'day',
      prefix: 'toto',
    });

    const data = {
      trip,
      meta,
      stack: [],
      result: 10,
      person: trip.people[0],
    };
    await test.apply(data);
    const datetime = trip.people[0].datetime;
    const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
    expect(meta.get(`toto.global.day.${day}-${month}-${year}`, null)).to.eq(1);
  });
});
