import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/logrequest.contract';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { ErrorStage } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['channel.service.only', ['proxy']],
    // ['can', ['acquisition.logrequest']],
  ],
})
export class LogRequestAction extends AbstractAction {
  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data
    delete params.headers.cookie;

    await this.repo.log({
      error_stage: ErrorStage.Acquisition,
      error_line: null,
      operator_id: get(context, 'call.user.operator_id', 0),
      journey_id: params.journey_id,
      source: 'logrequest',
      error_message: null,
      error_code: null,
      auth: get(context, 'call.user'),
      headers: get(context, 'call.metadata.req.headers', {}),
      body: params,
    });
  }
}
