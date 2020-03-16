import { Action as AbstractAction } from '@ilos/core';
import {
  handler,
  ContextType,
  KernelInterfaceResolver,
  NotFoundException,
} from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/cancel.contract';
import { alias } from '../shared/acquisition/cancel.schema';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

const callContext = {
  channel: {
    service: 'acquisition',
  },
  call: {
    user: {},
  },
};

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['journey.create']],
    ['validate', alias],
  ],
})
export class CreateJourneyAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // Store in database
    const { application_id, operator_id } = context.call.user;
    const exists = await this.journeyRepository.exists(params.journey_id, operator_id, application_id);

    if (!exists) {
      throw new NotFoundException(`Journey ${params.journey_id} doest not exist`);
    }

    // Perform cancelling action :)
    // use kernel.notify to carpool
  }
}
