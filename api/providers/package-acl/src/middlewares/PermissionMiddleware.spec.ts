import test from 'ava';
import { ParamsType, ContextType, ResultType, InvalidParamsException, ForbiddenException } from '@ilos/common';

import { PermissionMiddleware } from './PermissionMiddleware';

const middleware = new PermissionMiddleware();

const callFactory = (
  permissions: string[],
): { method: string; context: ContextType; params: ParamsType; result: ResultType } => ({
  method: 'test',
  context: {
    channel: {
      service: '',
      transport: 'http',
    },
    call: {
      user: {
        permissions,
      },
    },
  },
  params: {},
  result: null,
});

test('Permission middleware: matching 1 permission', async (t) => {
  const permissions = ['test.ok'];
  const { params, context } = callFactory(permissions);
  t.is(await middleware.process(params, context, () => {}, permissions), undefined);
});

test('Permission middleware: no method permissions', async (t) => {
  const permissions = ['test.ok'];
  const { params, context } = callFactory(permissions);
  await t.throwsAsync(middleware.process(params, context, () => {}, []), { instanceOf: InvalidParamsException });
});

test('Permission middleware: no user permissions', async (t) => {
  const { params, context } = callFactory([]);
  await t.throwsAsync(middleware.process(params, context, () => {}, ['not-ok']), { instanceOf: ForbiddenException });
});

test('Permission middleware: different permission', async (t) => {
  const permissions: string[] = ['test.ok'];
  const { params, context } = callFactory(permissions);
  await t.throwsAsync(middleware.process(params, context, () => {}, ['not-ok']), { instanceOf: ForbiddenException });
});

test('Permission middleware: not matching all permissions', async (t) => {
  const permissions: string[] = ['perm1'];
  const { params, context } = callFactory(permissions);
  await t.throwsAsync(middleware.process(params, context, () => {}, ['perm1', 'perm2']), {
    instanceOf: ForbiddenException,
  });
});
