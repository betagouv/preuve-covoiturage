import { get } from 'lodash';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, InvalidParamsException } from '@ilos/common';

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
      'scopeIt',
      [
        ['trip.export'],
        [
          (params, context): string => {
            if (
              'territory_id' in params &&
              context.call.user.territory_id &&
              context.call.user.authorizedTerritories.length &&
              params.territory_id.length &&
              params.territory_id.filter((id: number) => !context.call.use.authorizedTerritories.includes(id))
                .length === 0
            ) {
              return 'territory.trip.export';
            }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              context.call.user.operator_id &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
            ) {
              return 'operator.trip.export';
            }
          },
        ],
      ],
    ],
  ],
})
export class ExportAction extends Action {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const email = get(context, 'call.user.email');
    const fullname = `${get(context, 'call.user.firstname', '')} ${get(context, 'call.user.lastname', '')}`;

    if (!email) {
      throw new InvalidParamsException();
    }

    const start =
      (params && params.date && params.date.start) || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = (params && params.date && params.date.end) || new Date();

    const buildParams: BuildParamsInterface = {
      from: {
        type: context.call.user.territory_id ? 'territory' : context.call.user.operator_id ? 'operator' : 'registry',
        fullname,
        email,
      },
      query: {
        operator_id: params.operator_id,
        territory_id: params.territory_id,
        territory_authorized_operator_id: get(context, 'call.user.authorizedOperators', []),
        date: {
          start,
          end,
        },
      },
    };

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
