import { ContextType, handler, InvalidParamsException, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { copyGroupIdFromContextMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';
import { get } from 'lodash';
import * as middlewareConfig from '../config/middlewares';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/export.contract';
import { alias } from '../shared/trip/export.schema';
import {
  ParamsInterface as SendExportParamsInterface,
  signature as sendExportSignature,
} from '../shared/trip/sendExport.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdFromContextMiddlewares(['territory_id', 'operator_id'], null, true),
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
      maxEnd: () => new Date(new Date().getTime() - middlewareConfig.date.maxEndDefault),
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
    const email = get(context, 'call.user.email');
    const fullname = `${get(context, 'call.user.firstname', '')} ${get(context, 'call.user.lastname', '')}`;

    if (!email) {
      throw new InvalidParamsException('Missing user email');
    }

    const tz = await this.tripRepository.validateTz(params.tz);

    // use || syntax here in case we get null value from date.{start|end},
    // which will not use the default value of get()
    const start = get(params, 'date.start') || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = get(params, 'date.end') || new Date();

    const buildParams: SendExportParamsInterface = {
      type: context.call.user.territory_id ? 'territory' : context.call.user.operator_id ? 'operator' : 'registry',
      from: {
        fullname,
        email,
      },
      query: {
        date: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
      format: {
        tz: tz.name,
      },
    };

    if (params.operator_id) {
      buildParams.query.operator_id = Array.isArray(params.operator_id) ? params.operator_id : [params.operator_id];
    }

    if (params.territory_id) {
      buildParams.query.territory_id = Array.isArray(params.territory_id) ? params.territory_id : [params.territory_id];
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
