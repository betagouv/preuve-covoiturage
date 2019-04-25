// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { ProviderInterface } from '../interfaces/ProviderInterface';

import { Kernel } from './Kernel';
import { ServiceProvider } from './ServiceProvider';
import { Action } from './Action';

chai.use(chaiAsPromised);

class BasicAction extends Action {
  public readonly signature: string = 'add';
  protected async handle(params, context) {
    let count = 0;
    if ('add' in params) {
      const { add } = params;
      add.forEach((param) => {
        count += param;
      });
    } else {
      throw new Error('Please provide add param');
    }
    return count;
  }
}
class ProviderBasedAction extends Action {
  public readonly signature: string = 'config';
  protected async handle(params, context) {
    return (<any>this.kernel.get('config')).response;
  }
}
class BasicServiceProvider extends ServiceProvider {
  public readonly signature: string = 'math';
  actions = [BasicAction, ProviderBasedAction];
}
describe('Kernel', () => {
  it('should work with single call', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'math:add',
      params: {
        add: [1, 2],
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      result: 3,
    });
  });
  it('should work with a batch', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'math:add',
        params: {
          add: [1, 2],
        },
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'math:add',
        params: {
          add: [1, 5],
        },
      },
    ]);
    expect(response).to.deep.equal([
      {
        jsonrpc: '2.0',
        id: 1,
        result: 3,
      },
      {
        jsonrpc: '2.0',
        id: 2,
        result: 6,
      },
    ]);
  });
  it('should return an error if service is unknown', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'nope:add',
      params: {
        add: [1, 2],
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32601,
        data: 'Unknown service nope',
        message: 'Method not found',
      },
    });
  });

  it('should return an error if method is unknown', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'math:nope',
      params: {
        add: [1, 2],
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32601,
        data: 'Unknown method nope',
        message: 'Method not found',
      },
    });
  });
  it('should return an error if method throw an error', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'math:add',
      params: {},
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32000,
        message: 'Server error',
        data: 'Please provide add param',
      },
    });
  });
  it('should work with provider based call', async () => {
    class BasicKernel extends Kernel {
      services = [BasicServiceProvider];
      providers = [class ConfigProvider implements ProviderInterface {
        public readonly signature: string = 'config';
        response: string;
        boot() {
          this.response = 'Hello world';
        }
      }];
    }
    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'math:config',
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      result: 'Hello world',
    });
  });
});
