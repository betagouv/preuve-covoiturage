// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { Provider } from './Provider';
import { Action } from './Action';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';

chai.use(chaiAsPromised);

const kernel = {
  providers: [],
  services: [],
  boot() {},
  async handle(call) {
    return {
      id: null,
      jsonrpc: '2.0',
    };
  },
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

    class BasicProvider extends Provider {
      protected actions = [BasicAction];
    }

    const provider = new BasicProvider(kernel);
    provider.boot();
    const r = await provider.call('add', { add: [1, 1] });
    expect(r).to.equal(2);
  });

  it('should raise an error if no action is unknown', async () => {
    class BasicProvider extends Provider {
      protected actions = [];
    }

    const provider = new BasicProvider(kernel);
    provider.boot();

    try {
      await provider.call('add', { add: [1, 1] });
      expect(true).to.equal(false);
    } catch (e) {
      expect(e).to.be.a.instanceOf(Error);
      expect(e.message).to.equal('Unkmown method');
    }
  });
});
