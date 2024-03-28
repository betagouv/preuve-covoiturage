import { ContextType, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionMiddleware, validateDateMiddleware } from '@pdc/providers/middleware';
import { ParamsInterfaceV3, ResultInterfaceV3, handlerConfigV3 } from '@shared/export/create.contract';
import { aliasV3 } from '@shared/export/create.schema';
import { maxEndDefault, minStartDefault } from '../config/export';
import { DefaultTimezoneMiddleware } from '../middlewares/DefaultTimezoneMiddleware';

@handler({
  ...handlerConfigV3,
  middlewares: [
    ['validate', aliasV3],
    ['timezone', DefaultTimezoneMiddleware],
    copyFromContextMiddleware(`call.user._id`, 'created_by', true),
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
    copyFromContextMiddleware(`call.user.territory_id`, 'territory_id', true),
    hasPermissionMiddleware('common.export.create'),
    validateDateMiddleware({
      startPath: 'start_at',
      endPath: 'end_at',
      minStart: () => new Date(new Date().getTime() - minStartDefault),
      maxEnd: () => new Date(new Date().getTime() - maxEndDefault),
    }),
  ],
})
export class CreateActionV3 extends AbstractAction {
  constructor() {
    super();
  }

  protected async handle(params: ParamsInterfaceV3, context: ContextType): Promise<ResultInterfaceV3> {
    // TODO cast params, get target...

    console.debug('CreateActionV3.handle', params, context);
    // @ts-expect-error
    return params;
  }
}
