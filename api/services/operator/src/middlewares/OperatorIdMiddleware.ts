import { middleware, MiddlewareInterface, ContextType, ParamsType, ResultType } from '@ilos/common';

/**
 * OperatorId middleware injects the operator_id from the context to the params
 */
@middleware()
export class OperatorIdMiddleware implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: Function): Promise<ResultType> {
    if (context && context.call && context.call.user && context.call.user.operator_id) {
      params['operator_id'] = context.call.user.operator_id;
    }

    return next(params, context);
  }
}
