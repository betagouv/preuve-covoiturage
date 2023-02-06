import { serviceProviderMacro } from '@pdc/helper-test';
import { ServiceProvider } from './ServiceProvider';

const { test, boot } = serviceProviderMacro(ServiceProvider);
test(boot);
