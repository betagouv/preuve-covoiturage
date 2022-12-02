import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/observatory/insertFlux.contract';
import { alias } from '../shared/trip/buildExport.schema';
import { FluxRepositoryInterfaceResolver } from '../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares(handlerConfig.service),
    ['validate', alias],
  ],
})
export class SendExportAction extends AbstractAction {
  constructor(private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.fluxRepository.insertFlux(params);
  }
};