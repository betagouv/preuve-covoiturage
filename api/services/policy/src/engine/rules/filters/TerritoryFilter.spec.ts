import test from 'ava';

import { TerritoryBlacklistFilter, TerritoryWhitelistFilter } from './TerritoryFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { trip: TripInterface } {
  const trip = faker.trip([
    {
      is_driver: true,
      start: { aom: '217500016', com: '91471' },
      end: { aom: '217500016', com: '91471' },
    },
    {
      is_driver: false,
      start: { aom: '217500016', com: '91471' },
      end: { aom: '217500016', com: '91377' },
    },
  ]);

  return { trip };
}

test('should throw error if start and end is in blacklist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryBlacklistFilter([
    {
      start: { com: ['91471'] },
      end: { com: ['91471'] },
    },
  ]);
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[0],
    }),
  );
  t.is(err.message, TerritoryBlacklistFilter.description);
});

test('should do nothing if start and end is in blacklist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryBlacklistFilter([
    {
      start: { com: ['91471'] },
      end: { com: ['91471'] },
    },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
});

test('should throw error if start or end is in blacklist with OR operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryBlacklistFilter([
    { start: { com: ['91471'] }, end: {} },
    { start: {}, end: { com: ['91471'] } },
  ]);

  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
  t.is(err.message, TerritoryBlacklistFilter.description);
});

test('should throw error if start and end is in whitelist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryWhitelistFilter([
    {
      start: { com: ['91471'] },
      end: { com: ['91471'] },
    },
  ]);

  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
  t.is(err.message, TerritoryWhitelistFilter.description);
});

test('should do nothing if start and end is in whitelist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryWhitelistFilter([
    {
      start: { com: ['91471'] },
      end: { com: ['91471'] },
    },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[0],
    }),
  );
});

test('should do nothin if start or end is in whitelist with OR operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryWhitelistFilter([
    { start: { com: ['91471'] }, end: {} },
    { start: {}, end: { com: ['91471'] } },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
});
