import path from 'path';
import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { PermissionMiddleware } from '@ilos/package-acl';

import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { CertificatePrinterProvider } from './providers/CertificatePrinterProvider';
import { RenderCertificateAction } from './actions/RenderCertificateAction';
import { PrintCertificateAction } from './actions/PrintCertificateAction';
import { binding as renderBinding } from './shared/certificate/render.schema';
import { binding as printBinding } from './shared/certificate/print.schema';

@serviceProvider({
  config: __dirname,
  providers: [CertificatePgRepositoryProvider, CarpoolPgRepositoryProvider, CertificatePrinterProvider],
  validator: [renderBinding, printBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['can', PermissionMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [RenderCertificateAction, PrintCertificateAction],
  template: {
    path: path.resolve(__dirname, 'templates').replace('/dist/', '/src/'),
    meta: 'templates',
  },
})
export class ServiceProvider extends AbstractServiceProvider {}
