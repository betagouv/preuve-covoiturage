import anyTest, { TestFn } from 'ava';
import { serviceProviderMacro, ServiceProviderMacroContext } from '@pdc/helper-test';
import { ServiceProvider } from './ServiceProvider';

const test = anyTest as TestFn<ServiceProviderMacroContext>;
const { before, after, boot } = serviceProviderMacro(ServiceProvider);

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after.always(async (t) => {
  await after({ kernel: t.context.kernel });
});

test(boot);
