import { handler } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware/index.ts';
import { mapCertForListHelper } from '../helpers/mapCertForListHelper.ts';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/certificate/list.contract.ts';
import { alias } from '@shared/certificate/list.schema.ts';

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
      rows: results.map(mapCertForListHelper),
    };
  }
}
