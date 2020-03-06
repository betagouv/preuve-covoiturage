import anyTest from 'ava';
import { handler as handlerDecorator, serviceProvider as serviceProviderDecorator, ContextType } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider, Action as AbstractAction } from '@ilos/core';

import { serviceProviderMacro } from './serviceProviderMacro';

const handlerConfig = {
  service: 'test',
  method: 'hello',
};
type ParamsInterface = string;
type ResultInterface = string;

class CustomError extends Error {
  constructor(message: string) {
    super(`custom:${message}`);
  }
}

@handlerDecorator(handlerConfig)
class Action extends AbstractAction {
  async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (params === 'error') {
      throw new CustomError('test');
    }
    return `hello ${params}`;
  }
}

@serviceProviderDecorator({
  handlers: [Action],
})
class ServiceProvider extends AbstractServiceProvider {}

interface CustomInterface {
  hi: string;
}

const { test, success, error } = serviceProviderMacro<ParamsInterface, ResultInterface, CustomError, CustomInterface>(
  anyTest,
  ServiceProvider,
  handlerConfig,
);

test.before((t) => {
  t.context.hi = 'you';
});

test(success, 'toto', 'hello toto');
test(error, 'error', 'custom:test');

test('should preserve context type and before hook', (t) => {
  t.is(t.context.hi, 'you');
});
