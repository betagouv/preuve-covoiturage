import anyTest from 'ava';
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

import { handlerMacro } from './handlerMacro';

/**
 * Mock the action
 */
const handlerConfig = {
  service: 'test',
  method: 'run',
};
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

const { test, success, error } = handlerMacro<ParamsInterface, ResultInterface>(
  anyTest,
  ServiceProvider,
  handlerConfig,
);

test(success, 'call.user.permissions', ['test.run'], {
  call: { user: { permissions: ['test.run'] } },
  channel: { service: 'dummy' },
});

test(success, 'channel.service', 'dummy', {
  call: { user: { permissions: ['test.run'] } },
  channel: { service: 'dummy' },
});

test('undefined permissions = Forbidden Error', error, 'call.user.permissions', 'Forbidden Error');

test(error, 'call.user.permissions', 'Forbidden Error', {
  call: { user: { permissions: [] } },
  channel: { service: 'dummy' },
});
