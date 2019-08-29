// const { describe, it } = require('mocha');
const { expect } = require('chai');
const { route } = require('./geo');

describe('OSRM lookup', () => {
  it('finds Paris', async () => {
    const res = await route(
      {
        lat: 48.835286,
        lon: 2.340139,
      },
      {
        lat: 48.826082,
        lon: 2.326153,
      },
    );

    expect(res).to.deep.eq({ distance: 2545.3, duration: 302.8 });
  });

  it('finds La Réunion', async () => {
    const res = await route(
      {
        lat: -21.2675304,
        lon: 55.3662802,
      },
      {
        lat: -21.3423173,
        lon: 55.4747308,
      },
    );

    expect(res).to.deep.eq({ distance: 15935.1, duration: 1244.5 });
  });

  it('finds Mayotte', async () => {
    const res = await route(
      {
        lat: -12.781146,
        lon: 45.225513,
      },
      {
        lat: -12.837971,
        lon: 45.173657,
      },
    );

    expect(res).to.deep.eq({ distance: 10969.3, duration: 1330.9 });
  });

  it('finds La Guadeloupe', async () => {
    const res = await route(
      {
        lat: 16.122789,
        lon: -61.577865,
      },
      {
        lat: 16.259137,
        lon: -61.596402,
      },
    );

    expect(res).to.deep.eq({ distance: 18210.6, duration: 984.1 });
  });

  it('finds Guyane', async () => {
    const res = await route(
      {
        lat: 4.6761,
        lon: -52.477849,
      },
      {
        lat: 4.926402,
        lon: -52.286382,
      },
    );

    expect(res).to.deep.eq({ distance: 36155.7, duration: 2143.8 });
  });

  it('finds La Martinique', async () => {
    const res = await route(
      {
        lat: 14.642684,
        lon: -61.053267,
      },
      {
        lat: 14.486579,
        lon: -60.903747,
      },
    );

    expect(res).to.deep.eq({ distance: 37718.9, duration: 2845 });
  });
});
