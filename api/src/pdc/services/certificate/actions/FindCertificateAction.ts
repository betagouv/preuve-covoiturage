import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { channelServiceWhitelistMiddleware, hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';
import { mapCertForListHelper } from '../helpers/mapCertForListHelper.ts';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/certificate/find.contract.ts';
import { alias } from '@/shared/certificate/find.schema.ts';

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
