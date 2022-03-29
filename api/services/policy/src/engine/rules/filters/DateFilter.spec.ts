import test from 'ava';

import { faker } from '../../helpers/faker';
import { DateFilter } from './DateFilter';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { TripInterface } from '../../../interfaces';
import { RuleHandlerParamsInterface } from '../../interfaces';

function setup(): { rule: DateFilter; trip: TripInterface } {
  const rule = new DateFilter({
    whitelist: ['2021-01-02', '2021-01-03'],
    blacklist: ['2021-01-02', '2021-01-04'],
  });
  const trip = faker.trip([
    { datetime: new Date('2021-01-02') },
    { datetime: new Date('2021-01-03') },
    { datetime: new Date('2021-01-04') },
    { datetime: new Date('2021-01-05') },
  ]);
  return { rule, trip };
}

test('should throw error if in blacklist', async (t) => {
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

test('should do nothing if in whitelist', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[1],
    }),
  );
});

test('should do nothing if in whitelist even if in blacklist', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[0],
    }),
  );
});

test('should do nothing if not found', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: trip[3],
    }),
  );
});

test('should work with string', async (t) => {
  const { rule, trip } = setup();
  await t.notThrowsAsync(async () =>
    rule.filter({
      trip,
      stack: [],
      person: { ...trip[0], datetime: '2021-01-02' },
    } as unknown as RuleHandlerParamsInterface),
  );
});
