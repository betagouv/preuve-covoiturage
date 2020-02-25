import path from 'path';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { PermissionMiddleware } from '@pdc/package-acl';
import { DateProvider } from '@pdc/provider-date';
import { QrcodeProvider } from '@pdc/provider-qrcode';
import { CryptoProvider } from '@pdc/provider-crypto';
import { TemplateExtension } from '@pdc/provider-template';

import { config } from './config';
import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { HtmlPrinterProvider } from './providers/HtmlPrinterProvider';
import { RenderCertificateAction } from './actions/RenderCertificateAction';
import { CreateCertificateAction } from './actions/CreateCertificateAction';
import { FindCertificateAction } from './actions/FindCertificateAction';
import { DownloadCertificateAction } from './actions/DownloadCertificateAction';
import { SeedCommand } from './commands/SeedCommand';
import { binding as renderBinding } from './shared/certificate/render.schema';
import { binding as createBinding } from './shared/certificate/create.schema';
import { binding as findBinding } from './shared/certificate/find.schema';
import { binding as downloadBinding } from './shared/certificate/download.schema';

@serviceProvider({
  config,
  providers: [
    DateProvider,
    QrcodeProvider,
    CryptoProvider,
    CertificatePgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    HtmlPrinterProvider,
  ],
  validator: [renderBinding, createBinding, findBinding, downloadBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['can', PermissionMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [RenderCertificateAction, DownloadCertificateAction, CreateCertificateAction, FindCertificateAction],
  commands: [SeedCommand],
  template: {
    path: path.resolve(__dirname, 'templates').replace('/dist/', '/src/'),
    meta: 'templates',
  },
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [TemplateExtension];
}
