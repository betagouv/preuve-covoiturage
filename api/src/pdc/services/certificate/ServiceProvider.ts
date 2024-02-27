import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { DateProvider } from '@pdc/providers/date';
import { QrcodeProvider } from '@pdc/providers/qrcode';
import { CryptoProvider } from '@pdc/providers/crypto';
import { PdfCertProvider } from '@pdc/providers/pdfcert';

import { config } from './config';
import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider';
import { CreateCertificateAction } from './actions/CreateCertificateAction';
import { FindCertificateAction } from './actions/FindCertificateAction';
import { ListCertificateAction } from './actions/ListCertificateAction';
import { DownloadCertificateAction } from './actions/DownloadCertificateAction';
import { SeedCommand } from './commands/SeedCommand';
import { binding as createBinding } from '@shared/certificate/create.schema';
import { binding as findBinding } from '@shared/certificate/find.schema';
import { binding as downloadBinding } from '@shared/certificate/download.schema';
import { binding as listBinding } from '@shared/certificate/list.schema';

@serviceProvider({
  config,
  providers: [
    DateProvider,
    QrcodeProvider,
    CryptoProvider,
    CertificatePgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    PdfCertProvider,
  ],
  validator: [createBinding, findBinding, downloadBinding, listBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [DownloadCertificateAction, CreateCertificateAction, FindCertificateAction, ListCertificateAction],
  commands: [SeedCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
