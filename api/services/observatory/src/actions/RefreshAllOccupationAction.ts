import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface, signature } from '../shared/observatory/occupation/refreshAllOccupation.contract';
import { OccupationRepositoryInterfaceResolver } from '../interfaces/OccupationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares(handlerConfig.service),
  ],
})
export class RefreshAllOccupationAction extends AbstractAction implements InitHookInterface{
  constructor(
    private kernel: KernelInterfaceResolver,
    private fluxRepository: OccupationRepositoryInterfaceResolver,
  ) {
    super();
  }
  
  public async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(signature, null, {
      call: {
        user: {},
      },
      channel: { 
        service: handlerConfig.service,
        metadata:{
          jobId:'observatory.RefreshAllOccupation.action',
        } 
      }
    });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.fluxRepository.refreshAllOccupation(params);
  }
};