import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, signature } from '../../shared/observatory/flux/insertMonthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthFluxAction extends AbstractAction implements InitHookInterface {
  constructor(private kernel: KernelInterfaceResolver, private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  get currentMonth() {
    return new Date().getMonth();
  }

  public async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(
      signature,
      { year: this.currentYear, month: this.currentMonth },
      {
        channel: {
          service: handlerConfig.service,
          metadata: {
            jobId: 'observatory.InsertMonthlyFlux.cron',
            repeat: {
              cron: '0 6 8 * *',
            },
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.fluxRepository.deleteOneMonthFlux(params);
    return this.fluxRepository.insertOneMonthFlux(params);
  }
}
