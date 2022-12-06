import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface, signature } from '../shared/observatory/occupation/insertLastMonthOccupation.contract';
import { OccupationRepositoryInterfaceResolver } from '../interfaces/OccupationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares(handlerConfig.service),
  ],
})
export class InsertLastMonthOccupationAction extends AbstractAction implements InitHookInterface{
  constructor(
    private kernel: KernelInterfaceResolver,
    private fluxRepository: OccupationRepositoryInterfaceResolver,
  ) {
    super();
  }
  
  public async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(signature, null, {
      channel: { 
        service: handlerConfig.service,
        metadata:{
          jobId:'observatory.InsertMonthlyOccupation.cron',
          repeat:{
            cron: '0 6 8 * *',
          }
        } 
      }
    });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.fluxRepository.insertLastMonthOccupation(params);
  }
};