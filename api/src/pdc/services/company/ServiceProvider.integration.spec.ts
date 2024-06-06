import { serviceProviderMacro } from '/pdc/providers/test/index.ts';
import { ServiceProvider } from './ServiceProvider.ts';

const { test, boot } = serviceProviderMacro(ServiceProvider);
test(boot);
