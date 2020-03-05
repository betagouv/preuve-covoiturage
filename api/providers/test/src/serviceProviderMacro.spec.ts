import anyTest from 'ava';
import { serviceProvider as serviceProviderDecorator } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';

import { serviceProviderMacro } from './serviceProviderMacro';

@serviceProviderDecorator({})
class ServiceProvider extends AbstractServiceProvider {}

interface CustomInterface {
  hi: string;
}

const { test, boot } = serviceProviderMacro<CustomInterface>(anyTest, ServiceProvider);

test.before((t) => {
  t.context.hi = 'you';
});

test(boot);

test('should preserve context type and before hook', (t) => {
  t.is(t.context.hi, 'you');
});
