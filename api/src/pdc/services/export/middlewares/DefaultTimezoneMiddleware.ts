import { ContextType, middleware } from '@ilos/common';
import { ParamsInterfaceV3 } from '@shared/export/create.contract';

@middleware()
export class DefaultTimezoneMiddleware {
  async process(params: ParamsInterfaceV3, context: ContextType, next: Function): Promise<any> {
    if (!params.tz) {
      params.tz = 'Europe/Paris';
    }

    return next(params, context);
  }
}
