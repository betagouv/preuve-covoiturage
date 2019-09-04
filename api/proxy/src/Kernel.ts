import { kernel } from '@ilos/common';
import { Kernel as BaseKernel } from '@ilos/framework';
import { SentryProvider } from '@pdc/provider-sentry';

import { bootstrap as userBootstrap } from '@pdc/service-user';
import { bootstrap as operatorBootstrap } from '@pdc/service-operator';
import { bootstrap as territoryBootstrap } from '@pdc/service-territory';
import { bootstrap as applicationBootstrap } from '@pdc/service-application';
import { bootstrap as acquisitionBootstrap } from '@pdc/service-acquisition';
import { bootstrap as normalizationBootstrap } from '@pdc/service-normalization';
import { bootstrap as crosscheckBootstrap } from '@pdc/service-crosscheck';

@kernel({
  env: null,
  config: __dirname,
  children: [
    ...applicationBootstrap.serviceProviders,
    ...acquisitionBootstrap.serviceProviders,
    ...userBootstrap.serviceProviders,
    ...territoryBootstrap.serviceProviders,
    ...operatorBootstrap.serviceProviders,
    ...normalizationBootstrap.serviceProviders,
    ...crosscheckBootstrap.serviceProviders,
  ],
  providers: [SentryProvider],
})
export class Kernel extends BaseKernel {}
