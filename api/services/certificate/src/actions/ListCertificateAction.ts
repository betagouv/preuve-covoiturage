import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/certificate/list.contract';
import { alias } from '../shared/certificate/list.schema';

@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class ListCertificateAction extends AbstractAction {
  constructor(private certRepository: CertificateRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface[]> {
    const { operator_id } = params;

    // TODO operator_id
    console.log({ operator_id });

    const results = operator_id
      ? await this.certRepository.findByOperatorId(operator_id)
      : await this.certRepository.find();

    return results.map(
      (cert: CertificateInterface): ResultInterface => {
        return {
          tz: cert.meta.tz,
          operator: cert.meta.operator,
          territory: cert.meta.territory,
          total_km: cert.meta.total_km,
          total_point: cert.meta.total_point,
          total_cost: cert.meta.total_cost,
          remaining: cert.meta.remaining,
        };
      },
    );
  }
}
