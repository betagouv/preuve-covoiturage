import path from 'path';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { DateProvider } from '@pdc/provider-date';
import { QrcodeProvider } from '@pdc/provider-qrcode';
import { CryptoProvider } from '@pdc/provider-crypto';
import { PrinterProvider } from '@pdc/provider-printer';
import { TemplateExtension } from '@pdc/provider-template';

import { config } from './config';
import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { IdentityPgRepositoryProvider } from './providers/IdentityPgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { TerritoryPgRepository } from './providers/TerritoryPgRepositoryProvider';
import { RenderCertificateAction } from './actions/RenderCertificateAction';
import { CreateCertificateAction } from './actions/CreateCertificateAction';
import { FindCertificateAction } from './actions/FindCertificateAction';
import { ListCertificateAction } from './actions/ListCertificateAction';
import { DownloadCertificateAction } from './actions/DownloadCertificateAction';
import { SeedCommand } from './commands/SeedCommand';
import { binding as renderBinding } from './shared/certificate/render.schema';
import { binding as createBinding } from './shared/certificate/create.schema';
import { binding as findBinding } from './shared/certificate/find.schema';
import { binding as downloadBinding } from './shared/certificate/download.schema';
import { binding as listBinding } from './shared/certificate/list.schema';

@serviceProvider({
  config,
  providers: [
    DateProvider,
    QrcodeProvider,
    CryptoProvider,
    CertificatePgRepositoryProvider,
    IdentityPgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    TerritoryPgRepository,
    PrinterProvider,
  ],
  validator: [renderBinding, createBinding, findBinding, downloadBinding, listBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['can', PermissionMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [
    RenderCertificateAction,
    DownloadCertificateAction,
    CreateCertificateAction,
    FindCertificateAction,
    ListCertificateAction,
  ],
  commands: [SeedCommand],
  template: {
    path: path.resolve(__dirname, 'templates').replace('/dist/', '/src/'),
    meta: 'templates',
  },
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension, TemplateExtension];
}
