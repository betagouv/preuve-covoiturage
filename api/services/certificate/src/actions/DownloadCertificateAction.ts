import { Action as AbstractAction } from '@ilos/core';
import { handler, ConfigInterfaceResolver } from '@ilos/common';
import { PrinterProviderInterfaceResolver } from '@pdc/provider-printer';

// import { HtmlPrinterProviderInterfaceResolver } from '../interfaces/HtmlPrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/download.contract';
import { alias } from '../shared/certificate/download.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['certificate.download']],
  ],
})
export class DownloadCertificateAction extends AbstractAction {
  constructor(private config: ConfigInterfaceResolver, private printer: PrinterProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { uuid, type } = params;
    const url = `${this.config.get('url.certificateBaseUrl')}/render/${uuid}`;

    return this.printer.print(url, type, uuid, {
      auth: `${this.config.get('token.render.bearer')}`,
    });
  }
}
