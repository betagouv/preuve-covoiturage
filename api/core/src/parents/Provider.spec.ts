import { describe } from 'mocha';
import { expect } from 'chai';

import { Provider } from './Provider';
import { Action } from './Action';
import { CallInterface } from '../interfaces/CallInterface';

describe('Provider', () => {
  it('should work', () => {
    class BasicAction extends Action {
        public signature = 'add';
        protected handle(call: CallInterface):void {
          let result = 0;
          if ('add' in call.parameters) {
              const { add } = call.parameters;
              add.forEach(param => {
                  result += param;
                });
          }
          call.result.result = result;
          return;
     }
    }

    class BasicProvider extends Provider {
        protected actions = [BasicAction];
    }

    const provider = new BasicProvider;
    provider.boot();
    
    expect(provider.resolve({
        method: 'add',
        result: {},
        context: {
            internal: true,
        },
        parameters: {
            add: [1, 1],
        }
    }).result.result).equal(2);
  });

  it('should work with call', () => {
    class BasicAction extends Action {
        public signature = 'add';
        protected handle(call: CallInterface):void {
          let result = 0;
          if ('add' in call.parameters) {
              const { add } = call.parameters;
              add.forEach(param => {
                  result += param;
                });
          }
          call.result.result = result;
          return;
     }
    }

    class BasicProvider extends Provider {
        protected actions = [BasicAction];
    }

    const provider = new BasicProvider;
    provider.boot();
    
    expect(provider.call('add', { add: [1, 1] })).to.deep.equal({ result: 2});
  });
});
