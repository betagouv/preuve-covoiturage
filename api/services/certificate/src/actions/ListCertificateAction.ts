import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
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

    return {
      length,
      rows: results.map(
        (cert: CertificateInterface): ResultRowInterface => {
          return {
            uuid: cert.uuid,
            tz: cert.meta.tz,
            operator: cert.meta.operator,
            total_km: cert.meta.total_km,
            total_point: cert.meta.total_point ?? null,
            total_days: cert.meta.total_days ?? null,
            total_rm: cert.meta.total_rm ?? null,
          };
        },
      ),
    };
  }
}
