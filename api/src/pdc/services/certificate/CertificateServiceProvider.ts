import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { DateProvider } from "@/pdc/providers/date/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { PdfCertProvider } from "@/pdc/providers/pdfcert/index.ts";
import { QrcodeProvider } from "@/pdc/providers/qrcode/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { binding as createBinding } from "@/pdc/services/certificate/contracts/create.schema.ts";
import { binding as downloadBinding } from "@/pdc/services/certificate/contracts/download.schema.ts";
import { binding as findBinding } from "@/pdc/services/certificate/contracts/find.schema.ts";
import { binding as listBinding } from "@/pdc/services/certificate/contracts/list.schema.ts";
import { CreateCertificateAction } from "./actions/CreateCertificateAction.ts";
import { DownloadCertificateAction } from "./actions/DownloadCertificateAction.ts";
import { FindCertificateAction } from "./actions/FindCertificateAction.ts";
import { ListCertificateAction } from "./actions/ListCertificateAction.ts";
import { SeedCommand } from "./commands/SeedCommand.ts";
import { config } from "./config/index.ts";
import { CarpoolPgRepositoryProvider } from "./providers/CarpoolPgRepositoryProvider.ts";
import { CertificatePgRepositoryProvider } from "./providers/CertificatePgRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [
    DateProvider,
    QrcodeProvider,
    CertificatePgRepositoryProvider,
    CarpoolPgRepositoryProvider,
    PdfCertProvider,
  ],
  validator: [createBinding, findBinding, downloadBinding, listBinding],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [
    DownloadCertificateAction,
    CreateCertificateAction,
    FindCertificateAction,
    ListCertificateAction,
  ],
  commands: [SeedCommand],
})
export class CertificateServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
