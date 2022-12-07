import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface, signature } from '../../shared/observatory/flux/insertLastMonthFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares(handlerConfig.service),
  ],
})
export class InsertLastMonthFluxAction extends AbstractAction implements InitHookInterface{
  constructor(
    private kernel: KernelInterfaceResolver,
    private fluxRepository: FluxRepositoryInterfaceResolver,
  ) {
    super();
  }
  
  public async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(signature, null, {
      channel: { 
        service: handlerConfig.service,
        metadata:{
          jobId:'observatory.InsertMonthlyFlux.cron',
          repeat:{
            cron: '0 6 8 * *',
          }
        } 
      }
    });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.fluxRepository.insertLastMonthFlux(params);
  }
};