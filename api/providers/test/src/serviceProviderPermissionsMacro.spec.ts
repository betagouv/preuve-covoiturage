import anyTest from 'ava';
import { get } from 'lodash';
import { handler as handlerDecorator, serviceProvider as serviceProviderDecorator, ContextType } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider, Action as AbstractAction } from '@ilos/core';
import { PermissionMiddleware } from '@pdc/provider-acl';

import { handlerMacro } from './handlerMacro';

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
