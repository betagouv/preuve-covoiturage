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
        ['trip.list'],
        [
          (params, context): string => {
            if (
              'territory_id' in params &&
              params.territory_id.length === 1 &&
              params.territory_id[0] === context.call.user.territory_id
            ) {
              return 'territory.trip.list';
            }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
            ) {
              return 'operator.trip.list';
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
    const start =
      (params && params.date && params.date.start) || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = (params && params.date && params.date.end) || new Date();

    const email = get(context, 'call.user.email');
    const fullname = `${get(context, 'call.user.firstname', '')} ${get(context, 'call.user.lastname', '')}`;
    params.operator_territory_id = get(context, 'call.user.territory_id');

    if (!email) {
      throw new InvalidParamsException();
    }

    await this.kernel.notify<BuildParamsInterface>(
      buildSignature,
      {
        from: {
          fullname,
          email,
        },
        query: {
          ...params,
          date: {
            start,
            end,
          },
        },
      },
      {
        channel: {
          service: 'trip',
        },
        call: {
          user: {},
        },
      },
    );
  }
}
