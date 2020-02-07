import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { MetaMaximumFilter } from './MetaMaximumFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';
import { getMetaKey } from '../../helpers/getMetaKey';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;

const uuid = 'uuid';

const trip = faker.trip([
  {
    is_driver: true,
    identity_uuid: uuid,
  },
]);

describe('Policy rule: meta max filter', () => {
  it('should raise error if limit is reached for one person', () => {
    const test = new MetaMaximumFilter({
      target: 'driver',
      amount: 10,
      period: 'day',
      prefix: 'toto',
    });
    const person = trip.people[0];
    meta.set(getMetaKey('toto', person.datetime, 'day', person.identity_uuid), 100);
    const data = {
      person,
      trip,
      meta,
      stack: [],
    };
    return expect(test.filter(data)).to.eventually.rejectedWith(
      NotApplicableTargetException,
      MetaMaximumFilter.description,
    );
  });

  it('should raise error if limit is reached in global', () => {
    const test = new MetaMaximumFilter({
      amount: 10,
      period: 'day',
      prefix: 'toto',
    });
    const person = trip.people[0];
    meta.set(getMetaKey('toto', person.datetime, 'day', 'global'), 100);
    const data = {
      person,
      trip,
      meta,
      stack: [],
    };
    return expect(test.filter(data)).to.eventually.rejectedWith(
      NotApplicableTargetException,
      MetaMaximumFilter.description,
    );
  });
});
