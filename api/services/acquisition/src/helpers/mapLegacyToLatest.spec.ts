import test from 'ava';
import { mapLegacyToLatest } from './mapLegacyToLatest';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

function setup(): (jrn: any) => JourneyInterface {
  const operatorSiret = '12345678901234';
  return mapLegacyToLatest(operatorSiret);
}

test('converts financial props', (t) => {
  const mapper = setup();
  const legacy = {
    passenger: {
      cost: 0,
      contribution: 0,
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
    },
    driver: {
      cost: 300,
      revenue: 300,
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
    },
  };

  const latest: any = mapper(legacy);

  // api/providers/schema/src/models/person/schemas/passengerSchema.ts
  const properties = Reflect.ownKeys(latest);
  ['passenger', 'driver'].map((prop) => {
    t.true(properties.indexOf(prop) > -1);
  });

  t.is(latest.passenger.contribution, 0);
  t.deepEqual(latest.passenger.incentives, []);
  t.is(latest.passenger.cost, undefined);
  t.is(latest.passenger.incentive, undefined);
  t.is(latest.passenger.remaining_fee, undefined);
  t.is(latest.driver.revenue, 300);
  t.deepEqual(latest.driver.incentives, []);
  t.is(latest.driver.cost, undefined);
  t.is(latest.driver.incentive, undefined);
  t.is(latest.driver.remaining_fee, undefined);
});
test('moves travel_pass to identity', (t) => {
  const mapper = setup();
  const legacy = {
    passenger: {
      cost: 0,
      contribution: 0,
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
      identity: { over_18: true },
      travel_pass: {
        name: 'mytccard',
        user_id: '123456',
      },
    },
    driver: {
      cost: 300,
      revenue: 300,
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
    },
  };

  const latest: any = mapper(legacy);

  // api/providers/schema/src/models/person/schemas/passengerSchema.ts
  t.true('passenger' in latest);
  t.is(latest.passenger.contribution, 0);
  t.true('incentives' in latest.passenger);
  t.true('identity' in latest.passenger);
  t.true('travel_pass' in latest.passenger.identity);
  t.is(latest.passenger.identity.travel_pass.name, 'mytccard');
  t.is(latest.passenger.identity.travel_pass.user_id, '123456');
});

test('do not mutate non-legacy payloads', (t) => {
  const mapper = setup();
  const nonLegacy = {
    passenger: {
      contribution: 0,
      incentives: [],
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
      identity: { over_18: true },
    },
    driver: {
      revenue: 300,
      incentives: [],
      start: { datetime: new Date(new Date().getTime() - 1000) },
      end: { datetime: new Date() },
      identity: { over_18: true },
    },
  };

  const latest: any = mapper(nonLegacy);

  t.deepEqual(latest, nonLegacy);
});
