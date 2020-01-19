import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, ContextType } from '@ilos/common';

import { CertificatePrinterProviderInterfaceResolver } from '../interfaces/CertificatePrinterProviderInterface';
import { handlerConfig, ParamsInterface } from '../shared/certificate/print.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/certificate/print.schema';
import { castParams } from '../utils/castParams';

@handler(handlerConfig)
export class PrintCertificateAction extends AbstractAction {
  // public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.print']], ['validate', alias]];
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private kernel: KernelInterfaceResolver, private printer: CertificatePrinterProviderInterfaceResolver) {
    super();
  }

  // FIXME return type in ResultInterface declaration
  public async handle(params: ParamsInterface, context: ContextType): Promise<Buffer | string> {
    const { identity, start_at, end_at, type } = castParams<ParamsInterface>(params);

    switch (type) {
      case 'png':
        return this.printer.png(identity, start_at, end_at);
      case 'json':
        return this.kernel.call('certificate:render', params, context);
      default:
        return this.printer.pdf(identity, start_at, end_at);
    }
  }
}
