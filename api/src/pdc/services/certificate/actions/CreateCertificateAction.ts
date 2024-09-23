import {
  ConfigInterfaceResolver,
  ContextType,
  handler,
  KernelInterfaceResolver,
} from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { omit } from "@/lib/object/index.ts";
import {
  channelServiceWhitelistMiddleware,
  copyGroupIdAndApplyGroupPermissionMiddlewares,
} from "@/pdc/providers/middleware/index.ts";
import { uuid } from "@/pdc/providers/test/helpers.ts";
import { CarpoolInterface } from "@/shared/certificate/common/interfaces/CarpoolInterface.ts";
import { CertificateInterface } from "@/shared/certificate/common/interfaces/CertificateInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/certificate/create.contract.ts";
import { alias } from "@/shared/certificate/create.schema.ts";
import { WithHttpStatus } from "@/shared/common/handler/WithHttpStatus.ts";
import {
  createCastParamsHelper,
  CreateCastParamsInterface,
} from "../helpers/createCastParamsHelper.ts";
import {
  findOperator,
  FindOperatorInterface,
} from "../helpers/findOperatorHelper.ts";
import { mapFromCarpools } from "../helpers/mapFromCarpools.ts";
import {
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from "../interfaces/CarpoolRepositoryProviderInterface.ts";
import { CertificateRepositoryProviderInterfaceResolver } from "../interfaces/CertificateRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.certificate.create",
      registry: "registry.certificate.create",
    }),
    channelServiceWhitelistMiddleware("proxy"),
    ["validate", alias],
  ],
})
export class CreateCertificateAction extends AbstractAction {
  private findOperator: FindOperatorInterface;
  private castParams: CreateCastParamsInterface<ParamsInterface>;

  constructor(
    private kernel: KernelInterfaceResolver,
    private certRepository: CertificateRepositoryProviderInterfaceResolver,
    private carpoolRepository: CarpoolRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
    this.findOperator = findOperator(this.kernel);
    this.castParams = createCastParamsHelper(this.config);
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<WithHttpStatus<ResultInterface>> {
    const { identity, tz, operator_id, start_at, end_at, positions } = this
      .castParams(params);

    // fetch the data for this identity and operator and map to template object
    const operator = await this.findOperator({ operator_id, context });

    // fetch the data for this identity and operator and store the compiled data
    const findParams: FindParamsInterface = {
      identities: [identity],
      operator_id,
      tz,
      start_at,
      end_at,
      positions,
    };
    const carpools: CarpoolInterface[] = await this.carpoolRepository.find(
      findParams,
    );
    const certificate: CertificateInterface = await this.certRepository.create(
      mapFromCarpools({
        person: { uuid: uuid() }, // TODO remove the UUID completely
        operator,
        carpools,
        params: { tz, start_at, end_at, positions },
      }),
    );

    return {
      meta: { httpStatus: 201 },
      data: {
        uuid: certificate.uuid,
        created_at: certificate.created_at,
        meta: omit(certificate.meta, ["identity", "operator"]),
      },
    };
  }
}
