import { ConfigInterfaceResolver, ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { omit } from 'lodash';
import { createCastParamsHelper, CreateCastParamsInterface } from '../helpers/createCastParamsHelper';
import { findOperator, FindOperatorInterface } from '../helpers/findOperatorHelper';
import { findPerson, FindPersonInterface } from '../helpers/findPersonHelper';
import { MapFromCarpoolInterface, mapFromCarpoolsHelper } from '../helpers/mapFromCarpoolsHelper';
import {
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';
import { CertificateRepositoryProviderInterfaceResolver } from '../interfaces/CertificateRepositoryProviderInterface';
import { CarpoolInterface } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/certificate/create.contract';
import { alias } from '../shared/certificate/create.schema';
import { WithHttpStatus } from '../shared/common/handler/WithHttpStatus';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: 'operator.certificate.create',
      registry: 'registry.certificate.create',
    }),
    ['validate', alias],
  ],
})
export class CreateCertificateAction extends AbstractAction {
  private findOperator: FindOperatorInterface;
  private findPerson: FindPersonInterface;
  private castParams: CreateCastParamsInterface<ParamsInterface>;
  private store: MapFromCarpoolInterface;

  constructor(
    private kernel: KernelInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
    this.findOperator = findOperator(this.kernel);
    this.findPerson = findPerson(this.kernel);
    this.castParams = createCastParamsHelper(this.config);
    this.store = mapFromCarpoolsHelper(this.certRepository);
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<WithHttpStatus<ResultInterface>> {
    const { identity, tz, operator_id, start_at, end_at, positions } = this.castParams(params);

    // fetch the data for this identity and operator and map to template object
    const personUUID = await this.findPerson({ identity, operator_id });
    const operator = await this.findOperator({ operator_id, context });

    // fetch the data for this identity and operator and store the compiled data
    const findParams: FindParamsInterface = { personUUID, operator_id, tz, start_at, end_at, positions };
    const carpools: CarpoolInterface[] = await this.carpoolRepository.find(findParams);
    const certificate: CertificateInterface = await this.store({
      person: { uuid: personUUID },
      operator,
      carpools,
      params: { tz, start_at, end_at, positions },
    });

    return {
      meta: { httpStatus: 201 },
      data: {
        uuid: certificate.uuid,
        created_at: certificate.created_at,
        meta: omit(certificate.meta, ['identity', 'operator']),
      },
    };
  }
}
