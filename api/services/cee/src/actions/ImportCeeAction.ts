import { ContextType, handler, UnauthorizedException } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/importApplication.contract';

import { alias } from '../shared/cee/importApplication.schema';

import { CeeRepositoryProviderInterfaceResolver } from '../interfaces';
import { ServiceDisabledError } from '../errors/ServiceDisabledError';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class ImportCeeAction extends AbstractAction {
  constructor(protected ceeRepository: CeeRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_IMPORT', false)) {
      throw new ServiceDisabledError();
    }

    const { operator_id }: { operator_id: number } = context.call?.user;

    if (!operator_id || Number.isNaN(operator_id)) {
      throw new UnauthorizedException();
    }

    const result: ResultInterface = {
      imported: 0,
      failed: 0,
      failed_details: [],
    };

    for (const application of params) {
      try {
        await this.ceeRepository.importApplication({ ...application, operator_id });
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({ ...application, datetime: application.datetime.toISOString(), error: e.message });
      }
    }

    return result;
  }
}
