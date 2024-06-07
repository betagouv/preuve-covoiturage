import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { handler as handlerDecorator, serviceProvider as serviceProviderDecorator, ContextType } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider, Action as AbstractAction } from '@/ilos/core/index.ts';

import { handlerMacro, HandlerMacroContext } from './handlerMacro.ts';

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

beforeAll(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
  t.context.hi = 'you';
});

afterAll(async (t) => {
  await after({ kernel: t.context.kernel });
});

it('Success', success, 'toto', 'hello toto');
it('Error', error, 'error', 'custom:test');

it('should preserve context type and before hook', (t) => {
  assertEquals(t.context.hi, 'you');
});
