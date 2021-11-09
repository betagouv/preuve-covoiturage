import { ConfigInterfaceResolver, ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { UploadedResource } from '../interfaces';
import { DataGouvProvider } from '../providers/DataGouvProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/publishOpenData.contract';
import { alias } from '../shared/trip/publishOpenData.schema';
import { BuildResourceDescription } from './opendata/BuildResourceDescription';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class PublishOpenDataAction extends Action {
  constructor(
    private config: ConfigInterfaceResolver,
    private datagouv: DataGouvProvider,
    private buildResourceDescription: BuildResourceDescription,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { filepath, tripSearchQueryParam, excludedTerritories } = params;
    const datasetSlug = this.config.get('datagouv.datasetSlug');
    const description: string = await this.buildResourceDescription.call(tripSearchQueryParam, excludedTerritories);
    const uploadResource: UploadedResource = await this.datagouv.uploadResources(datasetSlug, filepath);
    await this.datagouv.updateResource(datasetSlug, { ...uploadResource, description });
  }
}
