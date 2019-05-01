import { describe } from 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as Bull from '../helpers/bullFactory';
import { queueHandlerFactory } from './QueueHandler';
import { EnvProvider } from '../providers/EnvProvider';
import { ConfigProvider } from '../providers/ConfigProvider';

chai.use(chaiAsPromised);

const { expect, assert } = chai;

class FakeEnvProvider extends EnvProvider {
  boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return 'prod';
  }
}

class FakeConfigProvider extends ConfigProvider {
  boot() {
    return;
  }
  get(key: string, fallback?: any): any {
    return 'redis://localhost';
  }
}
const envProvider = new FakeEnvProvider();
const configProvider = new FakeConfigProvider(envProvider);

const sandbox = sinon.createSandbox();

describe('Queue handler', () => {
  beforeEach(() => {
    sandbox.stub(Bull, 'bullFactory').callsFake(
      // @ts-ignore
      () => ({
      // @ts-ignore
        async add(name, opts) {
          if (name !== 'basic@0.0.1:nope') {
            return {
              name,
              opts,
            };
          }
          throw new Error('Nope');
        },
      }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('works', async () => {
    const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(envProvider, configProvider);
    const result = await queueProvider.call({
      method: 'method',
      params: { add: [1, 2] },
      context: { internal: true },
    });
    expect(result).to.deep.equal({
      name: 'basic@0.0.1:method',
      opts: {
        jsonrpc: '2.0',
        id: null,
        method: 'basic@0.0.1:method',
        params: { params: { add: [1, 2] }, _context: { internal: true } } },
    });
  });
  it('raise error if fail', async () => {
    const queueProvider = new (queueHandlerFactory('basic', '0.0.1'))(envProvider, configProvider);
    return (<any>assert).isRejected(
      queueProvider.call({
        method: 'nope',
        params: { add: [1, 2] },
        context: { internal: true },
      }),
      Error,
      'An error occured',
    );
  });
});

