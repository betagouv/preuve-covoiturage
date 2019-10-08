import { describe } from 'mocha';
import { expect } from 'chai';

import { mapLegacyToLatest } from './mapLegacyToLatest';

describe('mapLegacyToLatest', () => {
  const operatorSiret = '12345678901234';
  const mapper = mapLegacyToLatest(operatorSiret);

  it('convert legacy to latest', () => {
    const legacy = {
      passenger: {
        cost: 0,
        incentive: 0,
        start: { datetime: new Date(new Date().getTime() - 1000) },
        end: { datetime: new Date() },
      },
      driver: {
        revenue: 10,
        incentive: 0,
        start: { datetime: new Date(new Date().getTime() - 1000) },
        end: { datetime: new Date() },
      },
    };

    const latest: any = mapper(legacy);

    expect(latest).to.have.property('passenger');
    expect(latest.passenger).to.have.property('contribution', 0);
    expect(latest.passenger).to.have.property('incentives');
    expect(latest.passenger.cost).to.eq(undefined);
    expect(latest.passenger.incentive).to.eq(undefined);
    expect(latest.passenger.remaining_fee).to.eq(undefined);

    expect(latest).to.have.property('driver');
    expect(latest.driver).to.have.property('expense', 10);
    expect(latest.driver).to.have.property('incentives');
    expect(latest.driver.cost).to.eq(undefined);
    expect(latest.driver.incentive).to.eq(undefined);
    expect(latest.driver.remaining_fee).to.eq(undefined);
  });
});
