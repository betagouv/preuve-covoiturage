import { serviceProvider, NewableType, ExtensionInterface } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@/pdc/providers/validator/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';
import { DateProvider } from '@/pdc/providers/date/index.ts';
import { QrcodeProvider } from '@/pdc/providers/qrcode/index.ts';
import { CryptoProvider } from '@/pdc/providers/crypto/index.ts';
import { PdfCertProvider } from '@/pdc/providers/pdfcert/index.ts';

import { config } from './config/index.ts';
import { CertificatePgRepositoryProvider } from './providers/CertificatePgRepositoryProvider.ts';
import { CarpoolPgRepositoryProvider } from './providers/CarpoolPgRepositoryProvider.ts';
import { CreateCertificateAction } from './actions/CreateCertificateAction.ts';
import { FindCertificateAction } from './actions/FindCertificateAction.ts';
import { ListCertificateAction } from './actions/ListCertificateAction.ts';
import { DownloadCertificateAction } from './actions/DownloadCertificateAction.ts';
import { SeedCommand } from './commands/SeedCommand.ts';
import { binding as createBinding } from '@/shared/certificate/create.schema.ts';
import { binding as findBinding } from '@/shared/certificate/find.schema.ts';
import { binding as downloadBinding } from '@/shared/certificate/download.schema.ts';
import { binding as listBinding } from '@/shared/certificate/list.schema.ts';

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
