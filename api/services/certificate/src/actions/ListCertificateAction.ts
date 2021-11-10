import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { get } from 'lodash';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  ResultRowInterface,
} from '../shared/certificate/list.contract';
import { alias } from '../shared/certificate/list.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: 'operator.certificate.list',
      registry: 'registry.certificate.list',
    }),
  ],
})
export class ListCertificateAction extends AbstractAction {
  constructor(private certRepository: CertificateRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { operator_id } = params;

    const length = await this.certRepository.count(operator_id);

    const results = operator_id
      ? await this.certRepository.findByOperatorId(operator_id, false, params.pagination)
      : await this.certRepository.find(false, params.pagination);

    // TODO handle old formats

    return {
      length,
      rows: results.map(
        (cert: CertificateInterface): ResultRowInterface => {
          return {
            uuid: cert.uuid,
            tz: cert.meta.tz,
            operator: cert.meta.operator,
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
        },
      ),
    };
  }
}
