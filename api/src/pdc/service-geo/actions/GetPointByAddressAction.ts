import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/geo/getPointByAddress.contract';
import { alias } from '@shared/geo/getPointByAddress.schema';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.geo.find'), ['validate', alias]],
})
export class GetPointByAddressAction extends AbstractAction {
  constructor(private provider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.provider.literalToPosition(`${params.litteral}, ${params.country}`);
  }
}
