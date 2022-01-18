import test from 'ava';

import { MaxPassengerRestriction, MaxPassengerRestrictionParameters } from './MaxPassengerRestriction';
import { faker } from '../../helpers/faker';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { MetadataWrapper } from '../../../providers/MetadataWrapper';
import { TripInterface } from '../../../interfaces';

function setup(cfg: Partial<MaxPassengerRestrictionParameters> = {}): { rule: MaxPassengerRestriction; trip: TripInterface } {
  const basecfg: MaxPassengerRestrictionParameters = {
    uuid: 'test',
    amount: 10,
    target: 'driver',
  };

  const rule = new MaxPassengerRestriction({
    ...basecfg,
    ...cfg,
  });

  const trip = faker.trip([
    {
      trip_id: 'custom_trip_id',
      carpool_id: 1,
      identity_uuid: 'driver',
      is_driver: true,
    },
    {
      trip_id: 'custom_trip_id',
      carpool_id: 2,
      identity_uuid: 'passenger',
      is_driver: false,
      seats: 3,
    },
  ]);

  return { rule, trip };
}

test('should not export anything if wrong target', async (t) => {
  const meta = new MetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const context = {
    trip: trip,
    stack: [],
    person: trip.find((p) => !p.is_driver),
  };

  rule.initState(context, meta);
  const state = meta.export();
  t.deepEqual(Object.keys(state), []);
});

test('should export extra meta', async (t) => {
  const meta = new MetadataWrapper();
  const { rule, trip } = setup({ target: 'driver' });
  const context = {
    trip: trip,
    stack: [],
    person: trip.find((p) => p.is_driver),
  };

  rule.initState(context, meta);
  const state = meta.export();
  t.deepEqual(state, {
    test: `${MaxPassengerRestriction.slug}.driver.${context.person.trip_id}`,
    _extra: { passengers: 3 }
  });
});

test('should throw an exception if limit is reached', async (t) => {
  const meta = new MetadataWrapper();
  const { rule } = setup();
  await t.throwsAsync<NotApplicableTargetException>(async () => rule.apply(20, 20, meta));
});

test('should do nothing if limit is not reached', async (t) => {
  const meta = new MetadataWrapper();
  const { rule } = setup();
  await t.notThrowsAsync(async () => rule.apply(5, 0, meta));
});

test('should properly update state', async (t) => {
  const meta = new MetadataWrapper();
  meta.extraRegister({ passengers: 3 })
  const { rule } = setup();
  const result = rule.getNewState(5, 0, meta);
  t.is(result, 3);
});

test('should update result if limit will be reached', async (t) => {
  const meta = new MetadataWrapper();
  meta.extraRegister({ passengers: 3 })
  const { rule } = setup();
  const newResult = rule.apply(30, 9, meta);
  t.is(newResult, 10);
});
