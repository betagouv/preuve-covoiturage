import { describe } from 'mocha';
import { expect } from 'chai';

import { mapLegacyToLatest } from './mapLegacyToLatest';

describe('mapLegacyToLatest', () => {
  const operatorSiret = '12345678901234';
  const mapper = mapLegacyToLatest(operatorSiret);

  it('converts financial props', () => {
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
    expect(latest).to.have.property('passenger');
    expect(latest.passenger).to.have.property('contribution', 0);
    expect(latest.passenger).to.have.property('incentives');
    expect(latest.passenger.cost).to.eq(undefined);
    expect(latest.passenger.incentive).to.eq(undefined);
    expect(latest.passenger.remaining_fee).to.eq(undefined);

    // api/providers/schema/src/models/person/schemas/driverSchema.ts
    expect(latest).to.have.property('driver');
    expect(latest.driver).to.have.property('revenue', 300);
    expect(latest.driver).to.have.property('incentives');
    expect(latest.driver.cost).to.eq(undefined);
    expect(latest.driver.incentive).to.eq(undefined);
    expect(latest.driver.remaining_fee).to.eq(undefined);
  });

  it('moves travel_pass to identity', () => {
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
    expect(latest).to.have.property('passenger');
    expect(latest.passenger).to.have.property('contribution', 0);
    expect(latest.passenger).to.have.property('incentives');
    expect(latest.passenger).to.have.property('identity');
    expect(latest.passenger.identity).to.have.property('travel_pass');
    expect(latest.passenger.identity.travel_pass).to.have.property('name', 'mytccard');
    expect(latest.passenger.identity.travel_pass).to.have.property('user_id', '123456');
  });

  it('do not mutate non-legacy payloads', () => {
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

    expect(latest).to.deep.eq(nonLegacy);
  });
});
