// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { HandlerInterface } from '~/interfaces/HandlerInterface';
import { NewableType } from '~/types/NewableType';
import { ServiceProviderInterface } from '~/interfaces/ServiceProviderInterface';
import { ProviderInterface } from '~/interfaces/ProviderInterface';

import { ServiceProvider } from './ServiceProvider';
import { Action } from './Action';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { handler, provider } from '../Container';

chai.use(chaiAsPromised);

const { expect, assert } = chai;

describe('Service provider', () => {
  it('should register handler', async () => {
    @handler({
      service: 'test',
      method: 'add',
    })
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

    class BasicServiceProvider extends ServiceProvider {
      readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [];

      readonly handlers: NewableType<HandlerInterface>[] = [BasicAction];
    }

    const serviceProvider = new BasicServiceProvider();
    await serviceProvider.boot();

    const container = serviceProvider.getContainer();
    expect(container.getHandler({ service: 'test', method: 'add' })).be.instanceOf(BasicAction);
  });

  it('should register handler with alias', async () => {
    @provider()
    class Test implements ProviderInterface {
      base: string;
      boot() {
        this.base = 'Hello';
      }
      hello(name) {
        return `${this.base} ${name}`;
      }
    }

    @handler({
      service: 'test',
      method: 'hi',
    })
    class BasicAction extends Action {
      constructor(private test: Test) {
        super();
      }
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        if ('name' in params) {
          return this.test.hello(params.name);
        }
        throw new Error('Missing arguments');
      }
    }

    class BasicServiceProvider extends ServiceProvider {
      readonly alias = [
        [Test, Test],
      ];
      readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [];

      readonly handlers: NewableType<HandlerInterface>[] = [BasicAction];
    }

    const serviceProvider = new BasicServiceProvider();
    await serviceProvider.boot();

    const container = serviceProvider.getContainer();
    const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
    const response = await handlerInstance.call({ method: 'fake', params: { name: 'Sam' }, context: { internal: true } });
    expect(response).be.equal('Hello Sam');
  });

  it('should register handler with alias and nested service providers', async () => {
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
      service: 'test',
      method: 'hi',
    })
    class BasicAction extends Action {
      constructor(private test: Test) {
        super();
      }
      protected async handle(params: ParamsType, context: ContextType):Promise<ResultType> {
        if ('name' in params) {
          return this.test.hello(params.name);
        }
        throw new Error('Missing arguments');
      }
    }

    @handler({
      service: 'test',
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

    const serviceProvider = new BasicServiceProvider();
    await serviceProvider.boot();

    const container = serviceProvider.getContainer();
    const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
    const response = await handlerInstance.call({ method: 'fake', params: { name: 'Sam' }, context: { internal: true } });
    expect(response).be.equal('Hello Sam');

    const handlerTwoInstance = container.getHandler({ service: 'test', method: 'add' });
    const responseTwo = await handlerTwoInstance.call({ method: 'fake', params: { add: [21, 21] }, context: { internal: true } });
    expect(responseTwo).be.equal('Hello 42');

    const responseTwoBis = await handlerTwoInstance.call({ method: 'fake', params: { add: [21, 21] }, context: { internal: true } });
    expect(responseTwoBis).be.equal('Hi 42');
  });
});
