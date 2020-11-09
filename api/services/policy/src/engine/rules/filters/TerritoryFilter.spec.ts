import test from 'ava';

import { TerritoryBlacklistFilter, TerritoryWhitelistFilter } from './TerritoryFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { faker } from '../../helpers/faker';
import { TripInterface } from '../../../interfaces';

function setup(): { trip: TripInterface } {
  const trip = faker.trip([
    {
      is_driver: true,
      start_territory_id: [1],
      end_territory_id: [1],
    },
    {
      is_driver: false,
      start_territory_id: [1],
      end_territory_id: [2],
    },
  ]);

  return { trip };
}

test('should throw error if start and end is in blacklist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new TerritoryBlacklistFilter([
    {
      start: [1],
      end: [1],
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
      start: [1],
      end: [1],
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
    { start: [1], end: [] },
    { start: [], end: [1] },
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
      start: [1],
      end: [1],
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
      start: [1],
      end: [1],
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
    { start: [1], end: [] },
    { start: [], end: [1] },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
});
