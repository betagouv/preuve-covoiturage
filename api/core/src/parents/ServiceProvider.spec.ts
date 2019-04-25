// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ServiceProvider } from './ServiceProvider';
import { Action } from './Action';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';

import { MethodNotFoundException } from '../exceptions/MethodNotFoundException';

chai.use(chaiAsPromised);

const { expect, assert } = chai;

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

describe('Provider', () => {
  it('should work with call', async () => {
    class BasicAction extends Action {
      public readonly signature: string = 'add';
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

    class BasicProvider extends ServiceProvider {
      protected actions = [BasicAction];
    }

    const provider = new BasicProvider(kernel);
    provider.boot();
    const r = await provider.call('add', { add: [1, 1] });
    expect(r).to.equal(2);
  });

  it('should raise an error if no action is unknown', async () => {
    class BasicProvider extends ServiceProvider {
      protected actions = [];
    }

    const provider = new BasicProvider(kernel);
    await provider.boot();
    return (<any>assert).isRejected(provider.call('add', { add: [1, 1] }), MethodNotFoundException, 'Method not found');
  });
});
