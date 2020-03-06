import anyTest from 'ava';
import { serviceProviderMacro } from '@pdc/helper-test';
import { ServiceProvider } from './ServiceProvider';

const { test, boot } = serviceProviderMacro(anyTest, ServiceProvider);

test(boot);
