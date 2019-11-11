// import { Action as AbstractAction } from '@ilos/core';
// import { handler } from '@ilos/common';

// import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/print.contract';
// import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
// import { alias } from '../shared/certificate/print.schema';

// @handler(handlerConfig)
// export class PrintCertificateAction extends AbstractAction {
//   public readonly middlewares: ActionMiddleware[] = [['can', ['certificate.read']], ['validate', alias]];

//   constructor() {
//     super();
//   }

//   public async handle(params: ParamsInterface): Promise<ResultInterface> {}
// }
