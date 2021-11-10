import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware, channelServiceWhitelistMiddleware } from '@pdc/provider-middleware';
import { get } from 'lodash';
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

    const cert = await this.certRepository.findByUuid(uuid, true);

    return {
      uuid: cert.uuid,
      identity_uuid: get(cert, 'meta.identity.uuid', null),
      operator_uuid: get(cert, 'meta.operator.uuid', null),
      start_at: cert.start_at,
      end_at: cert.end_at,
      created_at: cert.created_at,
      driver: {
        uniq_days: get(cert, 'meta.driver.total.uniq_days', null),
        trips: get(cert, 'meta.driver.total.trips', null),
        km: get(cert, 'meta.driver.total.km', null),
        euros: get(cert, 'meta.driver.total.euros', null),
      },
      passenger: {
        uniq_days: get(cert, 'meta.passenger.total.uniq_days', null),
        trips: get(cert, 'meta.passenger.total.trips', null),
        km: get(cert, 'meta.passenger.total.km', null),
        euros: get(cert, 'meta.passenger.total.euros', null),
      },
    };
  }
}
