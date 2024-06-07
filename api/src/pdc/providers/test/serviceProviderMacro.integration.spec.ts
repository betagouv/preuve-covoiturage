import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { serviceProvider as serviceProviderDecorator } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';

import { serviceProviderMacro } from './serviceProviderMacro.ts';
import { ServiceProviderMacroContext } from './index.ts';

@serviceProviderDecorator({})
class ServiceProvider extends AbstractServiceProvider {}

interface CustomInterface {
  hi: string;
}

const { before, after, boot } = serviceProviderMacro<CustomInterface>(ServiceProvider);

const test = anyTest as TestFn<CustomInterface & ServiceProviderMacroContext>;

beforeAll(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
  t.context.hi = 'you';
});

afterAll(async (t) => {
  await after({ kernel: t.context.kernel });
});

it(boot);

it('should preserve context type and before hook', (t) => {
  assertEquals(t.context.hi, 'you');
});
