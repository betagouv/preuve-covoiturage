import test from 'ava';

import { ParamsType, ContextType, ResultType, ForbiddenException, InvalidParamsException } from '@ilos/common';

import { RoleMiddleware } from './RoleMiddleware';

const middleware = new RoleMiddleware();

const callFactory = (group: string, role: string) => ({
  method: 'test',
  context: <ContextType>{
    channel: {
      service: '',
      transport: 'http',
    },
    call: {
      user: {
        group,
        role,
      },
    },
  },
  params: <ParamsType>{},
  result: <ResultType>null,
});

test('Role middleware: super admin', async (t) => {
  const { params, context } = callFactory('registry', 'admin');
  t.is(await middleware.process(params, context, () => 'next()', ['superAdmin']), 'next()');
});

test('Role middleware: operator admin', async (t) => {
  const { params, context } = callFactory('operator', 'admin');
  t.is(await middleware.process(params, context, () => 'next()', ['admin']), 'next()');
});

test('Role middleware: territory admin', async (t) => {
  const { params, context } = callFactory('territory', 'admin');
  t.is(await middleware.process(params, context, () => 'next()', ['admin']), 'next()');
});

test('Role middleware: user', async (t) => {
  const { params, context } = callFactory('operator', 'user');
  t.is(await middleware.process(params, context, () => 'next()', ['user']), 'next()');
});

test('Role middleware: unknown', async (t) => {
  const { params, context } = callFactory('operator', 'user');
  await t.throwsAsync(middleware.process(params, context, () => 'next()', ['unknown']), {
    instanceOf: ForbiddenException,
  });
});

test('Role middleware: null', async (t) => {
  const { params, context } = callFactory('operator', 'user');
  await t.throwsAsync(middleware.process(params, context, () => 'next()', [null]), {
    instanceOf: InvalidParamsException,
  });
});

test('Role middleware: empty', async (t) => {
  const { params, context } = callFactory('operator', 'user');
  await t.throwsAsync(middleware.process(params, context, () => 'next()', []), { instanceOf: InvalidParamsException });
});
test('Role middleware: undefined', async (t) => {
  const { params, context } = callFactory('operator', 'user');
  await t.throwsAsync(middleware.process(params, context, () => 'next()', [undefined]), {
    instanceOf: InvalidParamsException,
  });
});
