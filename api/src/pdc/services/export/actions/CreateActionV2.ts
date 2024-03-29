import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware } from '@pdc/providers/middleware';
import {
  handlerConfigV2,
  ParamsInterfaceV2,
  ParamsInterfaceV3,
  ResultInterfaceV2,
  ResultInterfaceV3,
  signatureV3,
} from '@shared/export/create.contract';
import { aliasV2 } from '@shared/export/create.schema';
import { DefaultTimezoneMiddleware } from '../middlewares/DefaultTimezoneMiddleware';

@handler({
  ...handlerConfigV2,
  middlewares: [
    ['validate', aliasV2],
    ['timezone', DefaultTimezoneMiddleware],
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
    copyFromContextMiddleware(`call.user.territory_id`, 'territory_id', true),
  ],
})
export class CreateActionV2 extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async handle(paramsV2: ParamsInterfaceV2, context: ContextType): Promise<ResultInterfaceV2> {
    type AJVParams = Omit<ParamsInterfaceV3, 'start_at' | 'end_at'> & { start_at: string; end_at: string };

    const paramsV3: AJVParams = {
      tz: paramsV2.tz,
      start_at: paramsV2.date.start.toISOString(),
      end_at: paramsV2.date.end.toISOString(),
      operator_id: paramsV2.operator_id || [],
      created_by: context.call.user._id,
    };

    if (paramsV2.geo_selector) {
      paramsV3.geo_selector = paramsV2.geo_selector;
    }

    await this.kernel.call<AJVParams, ResultInterfaceV3>(signatureV3, paramsV3, context);
  }
}
