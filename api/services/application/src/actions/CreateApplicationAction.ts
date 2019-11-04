import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  RepositoryInterface,
} from '../shared/application/create.contract';
import { alias } from '../shared/application/create.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';
import { setOwner } from '../helpers/setOwner';

@handler(handlerConfig)
export class CreateApplicationAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias], ['can', ['application.create']]];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    data.permissions = data.permissions || ['journey.create'];

    return this.applicationRepository.create(data);

    // TODO move me to proxy
    // const token = await this.tokenProvider.sign({
    //   a: application._id.toString(),
    //   o: application.owner_id,
    //   s: application.owner_service,
    //   p: ['journey.create'],
    //   v: 2,
    // });

    // return { token, application };
  }
}
