import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware, channelServiceWhitelistMiddleware } from '@pdc/provider-middleware';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/certificate/find.contract';
import { alias } from '../shared/certificate/find.schema';
import { mapCertForListHelper } from '~/helpers/mapCertForListHelper';

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
