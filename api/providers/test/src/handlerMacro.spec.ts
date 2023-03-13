import anyTest, { TestFn } from 'ava';
import { handler as handlerDecorator, serviceProvider as serviceProviderDecorator, ContextType } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider, Action as AbstractAction } from '@ilos/core';

import { handlerMacro, HandlerMacroContext } from './handlerMacro';

const handlerConfig = {
  service: 'test',
  method: 'hello',
} as const;
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

interface CustomInterface extends HandlerMacroContext {
  hi: string;
}

const { before, after, success, error } = handlerMacro<ParamsInterface, ResultInterface, CustomError, CustomInterface>(
  ServiceProvider,
  handlerConfig,
);

const test = anyTest as TestFn<CustomInterface>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
  t.context.hi = 'you';
});

test.after(async (t) => {
  await after({ kernel: t.context.kernel });
});

test(success, 'toto', 'hello toto');
test(error, 'error', 'custom:test');

test('should preserve context type and before hook', (t) => {
  t.is(t.context.hi, 'you');
});
