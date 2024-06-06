import anyTest, { TestFn } from 'ava';
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

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
  t.context.hi = 'you';
});

test.after(async (t) => {
  await after({ kernel: t.context.kernel });
});

test(boot);

test('should preserve context type and before hook', (t) => {
  t.is(t.context.hi, 'you');
});
