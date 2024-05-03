import anyTest, { TestFn } from 'ava';
import { get } from 'lodash';
import { ServiceProvider as AbstractServiceProvider, Action as AbstractAction } from '@ilos/core';
import {
  handler as handlerDecorator,
  middleware,
  MiddlewareInterface,
  serviceProvider as serviceProviderDecorator,
  ContextType,
  ForbiddenException,
  InvalidParamsException,
} from '@ilos/common';

import { handlerMacro, HandlerMacroContext } from './handlerMacro';

/**
 * Mock the action
 */
const handlerConfig = {
  service: 'test',
  method: 'run',
} as const;
type ParamsInterface = string | null;
type ResultInterface = string | string[];

@handlerDecorator({
  ...handlerConfig,
  middlewares: [['can', ['test.run']]],
})
class Action extends AbstractAction {
  async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return get(context, params, []);
  }
}

/**
 * Mock the middleware
 */

declare type ParamsType = {};
declare type ResultType = {};

@middleware()
export class PermissionMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    neededPermissions: string[],
  ): Promise<ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new InvalidParamsException('No permissions defined');
    }

    let permissions = [];

    if (
      !!context.call &&
      !!context.call.user &&
      !!context.call.user.permissions &&
      !!context.call.user.permissions.length
    ) {
      permissions = context.call.user.permissions;
    }

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    const pass = neededPermissions.reduce((p, c) => p && (permissions || []).indexOf(c) > -1, true);

    if (!pass) {
      throw new ForbiddenException('Invalid permissions');
    }

    return next(params, context);
  }
}

/**
 * Mock the service provider
 */
@serviceProviderDecorator({
  handlers: [Action],
  middlewares: [['can', PermissionMiddleware]],
})
class ServiceProvider extends AbstractServiceProvider {}

const { before, after, success, error } = handlerMacro<ParamsInterface, ResultInterface>(
  ServiceProvider,
  handlerConfig,
);

const test = anyTest as TestFn<HandlerMacroContext>;
test.before(async (t) => {
  t.context = await before();
});

test.after(async (t) => {
  await after(t.context);
});

test('Success call.user.permissions', success, 'call.user.permissions', ['test.run'], {
  call: { user: { permissions: ['test.run'] } },
  channel: { service: 'dummy' },
});

test('Success channel.service', success, 'channel.service', 'dummy', {
  call: { user: { permissions: ['test.run'] } },
  channel: { service: 'dummy' },
});

test('undefined permissions = Forbidden Error', error, 'call.user.permissions', 'Forbidden Error');

test('Error call.user.permissions', error, 'call.user.permissions', 'Forbidden Error', {
  call: { user: { permissions: [] } },
  channel: { service: 'dummy' },
});
