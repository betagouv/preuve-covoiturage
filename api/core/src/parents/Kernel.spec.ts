// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { HandlerInterface } from '../interfaces/HandlerInterface';
import { NewableType } from '../types/NewableType';
import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { Kernel } from './Kernel';
import { ServiceProvider } from './ServiceProvider';
import { Action } from './Action';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { handler, provider } from '../container';

chai.use(chaiAsPromised);
const { expect } = chai;

@provider()
class Test implements ProviderInterface {
  base: string;
  boot() {
    this.base = 'Hello';
  }
  hello(name) {
    const response = `${this.base} ${name}`;
    this.base = 'Hi';
    return response;
  }
}

@handler({
  service: 'string',
  method: 'hi',
})
class BasicAction extends Action {
  constructor(private test: Test) {
    super();
  }
  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    if ('name' in params) {
      let from = '';
      if ('user' in context.call) {
        from = ` from ${context.call.user.name}`;
      }
      return this.test.hello(`${params.name}${from}`);
    }
    throw new Error('Missing arguments');
  }
}

@handler({
  service: 'math',
  method: 'add',
})
class BasicTwoAction extends Action {
  constructor(private test: Test) {
    super();
  }
  protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
    let count = 0;
    if ('add' in params) {
      const { add } = params;
      add.forEach((param) => {
        count += param;
      });
    } else {
      throw new Error('Please provide add param');
    }
    return this.test.hello(count);
  }
}

class BasicTwoServiceProvider extends ServiceProvider {
  readonly alias = [
    [Test, Test],
  ];
  readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [];

  readonly handlers: NewableType<HandlerInterface>[] = [BasicTwoAction];
}

class BasicServiceProvider extends ServiceProvider {
  readonly alias = [
    [Test, Test],
  ];
  readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [
    BasicTwoServiceProvider,
  ];

  readonly handlers: NewableType<HandlerInterface>[] = [BasicAction];
}

describe('Kernel', () => {
  it('should work with single call', async () => {
    class BasicKernel extends Kernel {
      serviceProviders = [BasicServiceProvider];
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
      result: 'Hello 3',
    });
  });

  it('should work with a batch', async () => {
    class BasicKernel extends Kernel {
      serviceProviders = [BasicServiceProvider];
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
        result: 'Hello 3',
      },
      {
        jsonrpc: '2.0',
        id: 2,
        result: 'Hi 6',
      },
    ]);
  });

  it('should return an error if service is unknown', async () => {
    class BasicKernel extends Kernel {
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
        data: 'Unknown method or service nope:add',
        message: 'Method not found',
      },
    });
  });

  it('should return an error if method throw an error', async () => {
    class BasicKernel extends Kernel {
      serviceProviders = [BasicServiceProvider];
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

  it('should work with contexted call', async () => {
    class BasicKernel extends Kernel {
      serviceProviders = [BasicServiceProvider];
    }

    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'string:hi',
      params: {
        params: {
          name: 'Jon',
        },
        _context: {
          channel: {
            service: '',
          },
          call: {
            user: {
              name: 'Nicolas',
            },
          },
        },
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      result: 'Hello Jon from Nicolas',
    });
  });

  it('should work with notify call', async () => {
    class BasicKernel extends Kernel {
      serviceProviders = [BasicServiceProvider];
    }

    const kernel = new BasicKernel();
    await kernel.boot();
    const response = await kernel.handle({
      jsonrpc: '2.0',
      method: 'string:hi',
      params: {
        params: {
          name: 'Jon',
        },
        _context: {
          channel: {
            service: '',
          },
          call: {
            user: {
              name: 'Nicolas',
            },
          },
        },
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: undefined,
      error: {
        code: -32601,
        data: 'Unknown method or service string:hi',
        message: 'Method not found',
      },
    });
  });
});
