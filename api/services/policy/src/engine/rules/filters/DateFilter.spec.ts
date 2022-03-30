import test from 'ava';

import { faker } from '../../helpers/faker';
import { DateFilter } from './DateFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { TripInterface } from '../../../interfaces';
import { RuleHandlerParamsInterface } from '../../interfaces';

function setup(whitelist = true): { rule: DateFilter; trip: TripInterface } {
  const rule = new DateFilter(whitelist ? { whitelist: ['2021-01-02', '2021-01-03'] } : { blacklist: ['2021-01-04'] });
  const trip = faker.trip([
    { datetime: new Date('2021-01-02') },
    { datetime: new Date('2021-01-04') },
    { datetime: new Date('2021-01-05') },
  ]);
  return { rule, trip };
}

test('should throw error if in blacklist', async (t) => {
  const { rule, trip } = setup(false);
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
  t.is(err.message, DateFilter.description);
});

test('should do nothing if in whitelist', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[0],
    }),
  );
});

test('should do nothing if not found and whitelist does not exits', async (t) => {
  const { rule, trip } = setup(false);
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[2],
    }),
  );
});

test('should throw if not found and whitelist exists', async (t) => {
  const { rule, trip } = setup();
  const err = await t.throwsAsync<NotApplicableTargetException>(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[2],
    }),
  );
  t.is(err.message, DateFilter.description);
});

test('should work with string', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: { ...trip[2], datetime: '2021-01-03T14:00:00.000Z' },
    } as unknown as RuleHandlerParamsInterface),
  );
});
