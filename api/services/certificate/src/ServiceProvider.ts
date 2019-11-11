import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { PermissionMiddleware } from '@ilos/package-acl';

import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { CertificatePrinterProvider } from './providers/CertificatePrinterProvider';
import { GenerateCertificateAction } from './actions/GenerateCertificateAction';
import { PrintCertificateAction } from './actions/PrintCertificateAction';
import { binding as generateBinding } from './shared/certificate/generate.schema';
import { binding as printBinding } from './shared/certificate/print.schema';

@serviceProvider({
  config: __dirname,
  providers: [CertificatePgRepositoryProvider, CarpoolPgRepositoryProvider, CertificatePrinterProvider],
  validator: [generateBinding, printBinding],
  middlewares: [['validate', ValidatorMiddleware], ['can', PermissionMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [GenerateCertificateAction, PrintCertificateAction],
})
export class ServiceProvider extends AbstractServiceProvider {}
