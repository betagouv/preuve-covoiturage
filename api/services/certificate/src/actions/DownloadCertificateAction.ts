import { Action as AbstractAction } from '@ilos/core';
import { handler, ConfigInterfaceResolver } from '@ilos/common';
import { PrinterProviderInterfaceResolver } from '@pdc/provider-printer';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

// import { HtmlPrinterProviderInterfaceResolver } from '../interfaces/HtmlPrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/download.contract';
import { alias } from '../shared/certificate/download.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['certificate.download']],
    ['channel.service.only', ['proxy']],
  ],
})
export class DownloadCertificateAction extends AbstractAction {
  constructor(
    private config: ConfigInterfaceResolver,
    private tokenProvider: TokenProviderInterfaceResolver,
    private printer: PrinterProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { uuid, type } = params;
    const url = `${this.config.get('url.certificateBaseUrl')}/render/${uuid}`;
    const auth = await this.tokenProvider.sign({ uuid, iss: this.config.get('url.apiUrl') });

    return this.printer.print(url, type, uuid, { auth });
  }
}
