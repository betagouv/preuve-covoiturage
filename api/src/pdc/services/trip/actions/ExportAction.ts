import { ContextType, handler, InvalidParamsException, KernelInterfaceResolver } from '/ilos/common/index.ts';
import { Action } from '/ilos/core/index.ts';
import { copyFromContextMiddleware, validateDateMiddleware } from '/pdc/providers/middleware/index.ts';
import _ from 'lodash';
import * as middlewareConfig from '../config/middlewares.ts';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces/index.ts';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/trip/export.contract.ts';
import { alias } from '/shared/trip/export.schema.ts';
import {
  ParamsInterface as SendExportParamsInterface,
  signature as sendExportSignature,
} from '/shared/trip/sendExport.contract.ts';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
    ...groupPermissionMiddlewaresHelper({
      territory: 'territory.trip.stats',
      operator: 'operator.trip.stats',
      registry: 'registry.trip.stats',
    }),
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'date.start',
      endPath: 'date.end',
      minStart: () => new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () => new Date(),
    }),
  ],
})
export class ExportAction extends Action {
  constructor(
    private kernel: KernelInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const email = _.get(context, 'call.user.email');
    const fullname = `${_.get(context, 'call.user.firstname', '')} ${_.get(context, 'call.user.lastname', '')}`;

    if (!email) {
      throw new InvalidParamsException('Missing user email');
    }

    const tz = await this.tripRepository.validateTz(params.tz);

    // use || syntax here in case we get null value from date.{start|end},
    // which will not use the default value of _.get()
    const start = _.get(params, 'date.start') || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = _.get(params, 'date.end') || new Date();

    const buildParams: SendExportParamsInterface = {
      type: context.call.user.territory_id ? 'territory' : context.call.user.operator_id ? 'operator' : 'registry',
      from: { fullname, email },
      query: {
        date: { start, end },
        geo_selector: params.geo_selector,
      },
      format: {
        tz: tz.name,
      },
    };

    if (params.operator_id) {
      buildParams.query.operator_id = Array.isArray(params.operator_id) ? params.operator_id : [params.operator_id];
    }

    await this.kernel.notify<SendExportParamsInterface>(sendExportSignature, buildParams, {
      channel: {
        service: 'trip',
      },
      call: {
        user: {},
      },
    });
  }
}
