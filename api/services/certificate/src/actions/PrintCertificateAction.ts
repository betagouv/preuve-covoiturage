import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { CertificatePrinterProviderInterfaceResolver } from '../interfaces/CertificatePrinterProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/print.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/print.schema';

@handler(handlerConfig)
export class PrintCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.print']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private printer: CertificatePrinterProviderInterfaceResolver) {
    super();
  }

  // FIXME return type in ResultInterface declaration
  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    console.log('printer: start');
    await this.printer.png();
    console.log('printer: end');
  }
}
