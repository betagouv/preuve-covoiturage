import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware, channelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/certificate/find.contract';
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

    const certificate = await this.certRepository.findByUuid(uuid, true);

    return {
      uuid: certificate.uuid,
      identity_uuid: certificate.meta.identity.uuid,
      operator_uuid: certificate.meta.operator.uuid,
      start_at: certificate.start_at,
      end_at: certificate.end_at,
      created_at: certificate.created_at,
      total_km: certificate.meta.total_km,
      total_point: certificate.meta.total_point ?? null,
      total_days: certificate.meta.total_days ?? null,
      total_rm: certificate.meta.total_rm ?? null,
    };
  }
}
