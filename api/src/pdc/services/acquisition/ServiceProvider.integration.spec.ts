import { serviceProviderMacro } from '@pdc/providers/test';
import { ServiceProvider } from './ServiceProvider';

const { test, boot } = serviceProviderMacro(ServiceProvider);
test(boot);
