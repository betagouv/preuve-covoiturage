import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { channelServiceWhitelistMiddleware, hasPermissionMiddleware } from '@pdc/provider-middleware';
import { mapCertForListHelper } from '../helpers/mapCertForListHelper';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/find.contract';
import { alias } from '../shared/certificate/find.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.certificate.find'),
    channelServiceWhitelistMiddleware('proxy'),
    ['validate', alias],
  ],
})
export class FindCertificateAction extends AbstractAction {
  constructor(private certRepository: CertificateRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { uuid } = params;

    return mapCertForListHelper(await this.certRepository.findByUuid(uuid, true));
  }
}
