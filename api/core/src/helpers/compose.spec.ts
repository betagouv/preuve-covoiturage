// tslint:disable max-classes-per-file

import { describe } from 'mocha';
import { expect } from 'chai';

import { compose } from './compose';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { ContextType, ResultType, ParamsType } from '../types';

class MiddlewareOne implements MiddlewareInterface {
  async process(params: { name: string }, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    const { name } = params;
    return next({ name: `${name} Stark` }, context);
  }
}
class MiddlewareTwo implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    const result = await next(params, context);
    return `${result} !!!`;
  }
}
class MiddlewareThree implements MiddlewareInterface {
  async process(params: { name: string }, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    const { name } = params;
    const { greeting } = options;
    const result = await next(`${greeting} ${name}`, context);
    return `${result}, welcome`;
  }
}

describe('Helpers: compose', () => {
  it('work', async () => {
    async function last(params: string, context: ContextType): Promise<ResultType> {
      return params;
    }
    const call = compose([new MiddlewareOne(), new MiddlewareTwo(), [new MiddlewareThree(), { greeting: 'Hello' }]]);
    const result = await call({ name: 'Arya' }, { channel: { service: 'test' } }, last);
    expect(result).to.eq('Hello Arya Stark, welcome !!!');
  });
});
