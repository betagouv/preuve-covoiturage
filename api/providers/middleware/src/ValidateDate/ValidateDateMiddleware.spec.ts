import test from 'ava';
import { ContextType, InvalidParamsException } from '@ilos/common';

import { ValidateDateMiddleware, ValidateDateMiddlewareOptionsType } from './ValidateDateMiddleware';

async function process(
  middlewareParams: ValidateDateMiddlewareOptionsType,
  callParams: any = {
    date: {
      start: new Date('2020-06-01'),
      end: new Date('2020-12-01'),
    },
  },
) {
  const context: ContextType = {
    call: {
      user: {},
    },
    channel: {
      service: '',
    },
  };

  const middleware = new ValidateDateMiddleware();
  const next = (params, context) => ({ params, context });
  return middleware.process(callParams, context, next, middlewareParams);
}

test('Middleware ValidateDate: should throw if start > end', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date(),
    maxEnd: () => new Date(),
    applyDefault: true,
  };

  const callParams = {
    date: {
      start: new Date('2021-01-01'),
      end: new Date('2020-01-01'),
    },
  };

  await t.throwsAsync(
    process(middlewareParams, callParams),
    { instanceOf: InvalidParamsException },
    'Start should be before end',
  );
});

test('Middleware ValidateDate: should throw if start < minstart', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2021-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: true,
  };
  await t.throwsAsync(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `Start should be after ${middlewareParams.minStart().toDateString()}`,
  );
});

test('Middleware ValidateDate: should throw if start not exist with minStart', async (t) => {
  const middlewareParams = {
    startPath: 'date.wrongstart',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: false,
  };
  await t.throwsAsync(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `Start should be after ${middlewareParams.minStart().toDateString()}`,
  );
});

test('Middleware ValidateDate: should throw if end > maxEnd', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2020-02-01'),
    applyDefault: true,
  };
  await t.throwsAsync(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `End should be before ${middlewareParams.maxEnd().toDateString()}`,
  );
});

test('Middleware ValidateDate: should throw if end not exist with maxEnd', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.wrongend',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: false,
  };

  await t.throwsAsync(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `End should be before ${middlewareParams.maxEnd().toDateString()}`,
  );
});

test('Middleware ValidateDate: should apply default if start missing', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: true,
  };

  const callParams = {
    date: {
      end: new Date('2020-01-01'),
    },
  };

  const result = await process(middlewareParams, callParams);
  t.is(result.params.date.start.toDateString(), middlewareParams.minStart().toDateString());
  t.is((callParams.date as any).start.toDateString(), middlewareParams.minStart().toDateString());
});

test('Middleware ValidateDate: should apply default if end missing', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: true,
  };

  const callParams = {
    date: {
      start: new Date('2020-01-01'),
    },
  };

  const result = await process(middlewareParams, callParams);
  t.is(result.params.date.end.toDateString(), middlewareParams.maxEnd().toDateString());
  t.is((callParams.date as any).end.toDateString(), middlewareParams.maxEnd().toDateString());
});
