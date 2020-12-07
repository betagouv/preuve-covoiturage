import { get } from 'lodash';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, InvalidParamsException } from '@ilos/common';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/export.contract';
import { alias } from '../shared/trip/export.schema';
import {
  signature as buildSignature,
  ParamsInterface as BuildParamsInterface,
} from '../shared/trip/buildExport.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeToGroup',
      {
        global: 'trip.export',
        territory: 'territory.trip.export',
        operator: 'operator.trip.export',
      },
    ],
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
      throw new InvalidParamsException();
    }

    const tz = await this.tripRepository.validateTz(params.tz);

    // use || syntax here in case we get null value from date.{start|end},
    // which will not use the default value of get()
    const start = get(params, 'date.start') || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = get(params, 'date.end') || new Date();

    const buildParams: BuildParamsInterface = ({
      from: {
        type: context.call.user.territory_id ? 'territory' : context.call.user.operator_id ? 'operator' : 'registry',
        fullname,
        email,
      },
      query: {
        operator_id: params.operator_id,
        territory_id: params.territory_id,
        territory_authorized_operator_id: get(context, 'call.user.authorizedOperators', []) || [],
        tz: tz.name,
        date: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    } as unknown) as BuildParamsInterface;

    // call trip:buildExport
    await this.kernel.notify<BuildParamsInterface>(buildSignature, buildParams, {
      channel: {
        service: 'trip',
      },
      call: {
        user: {},
      },
    });
  }
}
