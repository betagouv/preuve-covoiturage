import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { channelServiceWhitelistMiddleware, hasPermissionMiddleware } from '@pdc/providers/middleware';
import { mapCertForListHelper } from '../helpers/mapCertForListHelper';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/certificate/find.contract';
import { alias } from '@shared/certificate/find.schema';

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
    const { uuid, operator_id = null } = params;
    const certificate = await this.certRepository.findByUuid(uuid, operator_id, true);
    return mapCertForListHelper(certificate);
  }
}
