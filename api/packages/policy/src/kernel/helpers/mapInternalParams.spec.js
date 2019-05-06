const chai = require('chai');
const mapInternalParams = require('./mapInternalParams');
const { fakeTrip, fakePolicy } = require('./fake.js.js');

const { expect } = chai;

describe('incentive: param mapping helpers', () => {
  it('works', async () => {
    const fakeTripStakeholder = fakeTrip.people[0];
    const result = mapInternalParams({
      policy: fakePolicy,
      trip: fakeTrip,
      tripStakeholder: fakeTripStakeholder,
    });

    expect(result.conducteur).to.equal(fakeTripStakeholder.is_driver);
    expect(result.majeur).to.equal(fakeTripStakeholder.identity.over_18);
    expect(result.duree).to.equal(fakeTripStakeholder.duration);
    expect(result.distance).to.equal(fakeTripStakeholder.distance);
    expect(result.depart_sur_territoire)
      .to.equal((fakeTripStakeholder.start.aom._id === fakePolicy.aom));
    expect(result.arrivee_sur_territoire)
      .to.equal((fakeTripStakeholder.end.aom._id === fakePolicy.aom));
    expect(result.classe_de_preuve).to.equal(1);
    expect(result.nombre_de_passager).to.equal((fakeTrip.people.length - 1));
    expect(result.nombre_de_siege).to.equal(fakeTripStakeholder.seats);
  });
});
