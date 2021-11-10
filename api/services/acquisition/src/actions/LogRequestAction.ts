import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/logrequest.contract';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';
import { ErrorStage } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('acquisition.logrequest')],
})
export class LogRequestAction extends AbstractAction {
  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data
    if ('headers' in params && 'cookie' in params.headers) {
      delete params.headers.cookie;
    }

    if ('headers' in params && 'authorization' in params.headers) {
      delete params.headers.authorization;
    }

    await this.repo.log({
      error_stage: ErrorStage.Acquisition,
      error_line: null,
      operator_id: get(context, 'call.user.operator_id', params.operator_id || 0),
      journey_id: get(params, 'body.journey_id', get(params, 'journey_id', null)),
      source: 'logrequest',
      request_id: get(params, 'request_id', get(params, 'headers.x-request-id'), null),
      error_message: null,
      error_code: null,
      auth: get(context, 'call.user'),
      headers: get(context, 'call.metadata.req.headers', {}),
      body: params,
    });
  }
}
