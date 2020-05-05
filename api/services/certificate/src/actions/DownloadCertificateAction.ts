import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { HtmlPrinterProviderInterfaceResolver } from '../interfaces/HtmlPrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/download.contract';
import { alias } from '../shared/certificate/download.schema';

@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class DownloadCertificateAction extends AbstractAction {
  constructor(private printer: HtmlPrinterProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    switch (params.type) {
      case 'png':
        return this.printer.png(params.uuid);
      default:
        return this.printer.pdf(params.uuid);
    }
  }
}
