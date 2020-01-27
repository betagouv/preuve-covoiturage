import path from 'path';
import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { PermissionMiddleware } from '@ilos/package-acl';
import { DateProvider } from '@pdc/provider-date';
import { QrcodeProvider } from '@pdc/provider-qrcode';
import { CryptoProvider } from '@pdc/provider-crypto';

import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { CertificatePrinterProvider } from './providers/CertificatePrinterProvider';
import { RenderCertificateAction } from './actions/RenderCertificateAction';
import { CreateCertificateAction } from './actions/CreateCertificateAction';
import { FindCertificateAction } from './actions/FindCertificateAction';
import { SeedCommand } from './commands/SeedCommand';
import { binding as renderBinding } from './shared/certificate/render.schema';
import { binding as createBinding } from './shared/certificate/create.schema';
import { binding as findBinding } from './shared/certificate/find.schema';

@serviceProvider({
  config: __dirname,
  providers: [
    DateProvider,
    QrcodeProvider,
    CryptoProvider,
    CertificatePgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    CertificatePrinterProvider,
  ],
  validator: [renderBinding, createBinding, findBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['can', PermissionMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [RenderCertificateAction, CreateCertificateAction, FindCertificateAction],
  commands: [SeedCommand],
  template: {
    path: path.resolve(__dirname, 'templates').replace('/dist/', '/src/'),
    meta: 'templates',
  },
})
export class ServiceProvider extends AbstractServiceProvider {}
