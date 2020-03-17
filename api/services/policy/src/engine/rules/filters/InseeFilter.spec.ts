import test from 'ava';
import { InseeBlacklistFilter, InseeWhitelistFilter } from './InseeFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

import { faker } from '../../helpers/faker';

function setup() {
  const trip = faker.trip([
    {
      is_driver: true,
      start_insee: 'A',
      end_insee: 'A',
    },
    {
      is_driver: false,
      start_insee: 'A',
      end_insee: 'B',
    },
  ]);

  return { trip };
}

test('should throw error if start and end is in blacklist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeBlacklistFilter([
    {
      start: ['A'],
      end: ['A'],
    },
  ]);
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
  t.is(err.message, InseeBlacklistFilter.description);
});

test('should do nothing if start and end is in blacklist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeBlacklistFilter([
    {
      start: ['A'],
      end: ['A'],
    },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
});

test('should throw error if start or end is in blacklist with OR operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeBlacklistFilter([
    { start: ['A'], end: [] },
    { start: [], end: ['A'] },
  ]);

  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
  t.is(err.message, InseeBlacklistFilter.description);
});

test('should throw error if start and end is in whitelist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeWhitelistFilter([
    {
      start: ['A'],
      end: ['A'],
    },
  ]);

  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
  t.is(err.message, InseeWhitelistFilter.description);
});

test('should do nothing if start and end is in whitelist with AND operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeWhitelistFilter([
    {
      start: ['A'],
      end: ['A'],
    },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[0],
    }),
  );
});

test('should do nothin if start or end is in whitelist with OR operator', async (t) => {
  const { trip } = setup();
  const rule = new InseeWhitelistFilter([
    { start: ['A'], end: [] },
    { start: [], end: ['A'] },
  ]);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip.people[1],
    }),
  );
});
