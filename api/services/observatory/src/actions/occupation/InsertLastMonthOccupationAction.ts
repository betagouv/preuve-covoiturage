import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import {
  handlerConfig,
  ParamsInterface,
  signature,
} from '../../shared/observatory/occupation/insertMonthlyOccupation.contract';
import { OccupationRepositoryInterfaceResolver } from '../../interfaces/OccupationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthOccupationAction extends AbstractAction implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private occupationRepository: OccupationRepositoryInterfaceResolver,
  ) {
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
            jobId: 'observatory.InsertMonthlyOccupation.cron',
            repeat: {
              cron: '0 6 8 * *',
            },
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.occupationRepository.deleteOneMonthOccupation(params);
    return this.occupationRepository.insertOneMonthOccupation(params);
  }
}
