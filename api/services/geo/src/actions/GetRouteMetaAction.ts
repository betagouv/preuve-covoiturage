import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/geo/getRouteMeta.contract';
import { alias } from '../shared/geo/getRouteMeta.schema';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.geo.find'), ['validate', alias]],
})
export class GetRouteMetaAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.getRouteMeta(params.start, params.end);
  }
}
