import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { ContextType, InvalidParamsException } from '@/ilos/common/index.ts';

import { ValidateDateMiddleware, ValidateDateMiddlewareParams } from './ValidateDateMiddleware.ts';

async function process(
  middlewareParams: ValidateDateMiddlewareParams,
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

it('Middleware ValidateDate: should throw if start > end', async (t) => {
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

  await assertThrows(
    process(middlewareParams, callParams),
    { instanceOf: InvalidParamsException },
    'Start should be before end',
  );
});

it('Middleware ValidateDate: should throw if start < minstart', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2021-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: true,
  };
  await assertThrows(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `Start should be after ${middlewareParams.minStart().toDateString()}`,
  );
});

it('Middleware ValidateDate: should throw if start not exist with minStart', async (t) => {
  const middlewareParams = {
    startPath: 'date.wrongstart',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: false,
  };
  await assertThrows(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `Start should be after ${middlewareParams.minStart().toDateString()}`,
  );
});

it('Middleware ValidateDate: should throw if end > maxEnd', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.end',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2020-02-01'),
    applyDefault: true,
  };
  await assertThrows(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `End should be before ${middlewareParams.maxEnd().toDateString()}`,
  );
});

it('Middleware ValidateDate: should throw if end not exist with maxEnd', async (t) => {
  const middlewareParams = {
    startPath: 'date.start',
    endPath: 'date.wrongend',
    minStart: () => new Date('2019-01-01'),
    maxEnd: () => new Date('2021-02-01'),
    applyDefault: false,
  };

  await assertThrows(
    process(middlewareParams),
    { instanceOf: InvalidParamsException },
    `End should be before ${middlewareParams.maxEnd().toDateString()}`,
  );
});

it('Middleware ValidateDate: should apply default if start missing', async (t) => {
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
  assertEquals(result.params.date.start.toDateString(), middlewareParams.minStart().toDateString());
  assertEquals((callParams.date as any).start.toDateString(), middlewareParams.minStart().toDateString());
});

it('Middleware ValidateDate: should apply default if end missing', async (t) => {
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
  assertEquals(result.params.date.end.toDateString(), middlewareParams.maxEnd().toDateString());
  assertEquals((callParams.date as any).end.toDateString(), middlewareParams.maxEnd().toDateString());
});
