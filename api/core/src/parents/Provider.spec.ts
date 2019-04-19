// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import { expect, assert } from 'chai';

import { Provider } from './Provider';
import { Action } from './Action';
import { CallInterface } from '../interfaces/communication/CallInterface';

describe('Provider', () => {
  it('should work', () => {
    class BasicAction extends Action {
      public signature = 'add';
      protected handle(call: CallInterface):void {
        let result = 0;
        if ('add' in call.parameters) {
          const { add } = call.parameters;
          add.forEach((param) => {
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

    const provider = new BasicProvider();
    provider.boot();

    expect(provider.resolve({
      method: 'add',
      result: {},
      context: {
        internal: true,
      },
      parameters: {
        add: [1, 1],
      },
    }).result.result).equal(2);
  });

  it('should work with call', async () => {
    class BasicAction extends Action {
      public signature = 'add';
      protected handle(call: CallInterface):void {
        let result = 0;
        if ('add' in call.parameters) {
          const { add } = call.parameters;
          add.forEach((param) => {
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

    const provider = new BasicProvider();
    provider.boot();
    const r = await provider.call('add', { add: [1, 1] });
    expect(r).to.deep.equal({ result: 2 });
  });

  it('should raise an error if no action is unknown', async () => {
    class BasicProvider extends Provider {
      protected actions = [];
    }

    const provider = new BasicProvider();
    provider.boot();

    // TODO refactor with chai as promised
    try {
      await provider.call('add', { add: [1, 1] });
    } catch (e) {
      expect(e).to.be.a('error');
      expect(e.message).equal('Unkmown method');
    }
  });
});
