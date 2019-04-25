// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Action } from './Action';
import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';

chai.use(chaiAsPromised);
const kernel = {
  providers: [],
  services: [],
  boot() { return; },
  async handle(call) {
    return {
      id: null,
      jsonrpc: '2.0',
    };
  },
  get() { throw new Error(); },
};

describe('Action', () => {
  it('should work', async () => {
    class BasicAction extends Action {
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let count = 0;
        if ('add' in params) {
          const { add } = params;
          add.forEach((param) => {
            count += param;
          });
        }
        return count;
      }
    }
    const action = new BasicAction(kernel);
    const result = await action.call({
      result: 0,
      method: '',
      params: {
        add: [1, 1],
      },
      context: {
        internal: true,
      },
    });
    expect(result).equal(2);
  });

  it('should work with middleware', async () => {
    class BasicAction extends Action {
      protected middlewares = [async (call: CallType, next: Function) => {
        await next();
        call.result -= 1;
      }];
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let count = 0;
        if ('add' in params) {
          const { add } = params;
          add.forEach((param) => {
            count += param;
          });
        }
        return count;
      }
    }
    const action = new BasicAction(kernel);
    const result = await action.call({
      result: 0,
      method: '',
      params: {
        add: [1, 1],
      },
      context: {
        internal: true,
      },
    });
    expect(result).equal(1);
  });

  it('should work with ordered middleware', async () => {
    class BasicAction extends Action {
      protected middlewares: MiddlewareInterface[] = [async (call: CallType, next: Function) => {
        await next();
        call.result = `hello ${call.result}?`;
      }, async (call: CallType, next: Function) => {
        await next();
        call.result = `world ${call.result}!`;
      }];
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        let result = '';
        if ('name' in params) {
          result = params.name;
        }
        return result;
      }
    }
    const action = new BasicAction(kernel);
    const result = await action.call({
      result: '',
      method: '',
      params: {
        name: 'Sam',
      },
      context: {
        internal: true,
      },
    });
    expect(result).equal('hello world Sam!?');
  });

  it('should raise an error if no handle method is defined', () => {
    class BasicAction extends Action {}
    const action = new BasicAction(kernel);
    return (<any>expect(action.call({
      result: {},
      method: '',
      params: {
        params: {
          name: 'Sam',
        },
      },
      context: {
        internal: true,
      },
    })).to).eventually
    .be.rejectedWith('No implementation found')
    .and.be.an.instanceOf(Error);
  });
});
