import { serviceProviderMacro } from '@pdc/provider-test';
import { ServiceProvider } from './ServiceProvider';

const { test, boot } = serviceProviderMacro(ServiceProvider);
test(boot);
