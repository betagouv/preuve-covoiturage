import { Container, Interfaces, Types } from '@ilos/core';

/**
 * OperatorId middleware injects the operator_id from the context to the params
 */
@Container.middleware()
export class OperatorIdMiddleware implements Interfaces.MiddlewareInterface {
  async process(params: Types.ParamsType, context: Types.ContextType, next: Function): Promise<Types.ResultType> {
    console.log('OperatorIdMid', context);
    if (context && context.call && context.call.user && context.call.user.operator_id) {
      params['operator_id'] = context.call.user.operator_id;
    }

    return next(params, context);
  }
}
