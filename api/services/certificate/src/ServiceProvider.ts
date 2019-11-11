import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { PermissionMiddleware } from '@ilos/package-acl';

import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { GenerateCertificateAction } from './actions/GenerateCertificateAction';
import { binding as generateBinding } from './shared/certificate/generate.schema';

@serviceProvider({
  config: __dirname,
  providers: [CertificatePgRepositoryProvider, CarpoolPgRepositoryProvider],
  validator: [generateBinding],
  middlewares: [['validate', ValidatorMiddleware], ['can', PermissionMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [GenerateCertificateAction],
})
export class ServiceProvider extends AbstractServiceProvider {}
