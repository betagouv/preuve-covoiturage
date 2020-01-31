import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { HtmlPrinterProviderInterfaceResolver } from '../interfaces/HtmlPrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/download.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/download.schema';

@handler(handlerConfig)
export class DownloadCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.download']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private printer: HtmlPrinterProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    switch (params.type) {
      case 'png':
        return this.printer.png(params.uuid);
      // case 'json':
      // return this.kernel.call('certificate:render', params, context);
      default:
        return this.printer.pdf(params.uuid);
    }
  }
}
