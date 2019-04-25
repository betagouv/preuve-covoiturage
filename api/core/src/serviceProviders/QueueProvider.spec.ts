import { describe } from 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as Bull from '../helpers/bullFactory';
import { queueServiceProviderFactory } from '../helpers/queueServiceProviderFactory';

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
  get(key:string) {
    if (key === 'env') {
      return {
        signature: 'env',
        boot() { return; },
        get() {
          return 'prod';
        },
      };
    }
    if (key === 'config') {
      return {
        signature: 'config',
        boot() { return; },
        get() {
          return 'redis://localhost';
        },
      };
    }
  },
  async up() { return; },
  async down() { return; },
};

const sandbox = sinon.createSandbox();

describe('Queue provider', () => {
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
    const queueProvider = new (queueServiceProviderFactory('basic', '0.0.1'))(kernel);
    await queueProvider.boot();
    const result = await queueProvider.call('method', { add: [1, 2] }, { internal: true });
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
    const queueProvider = new (queueServiceProviderFactory('basic', '0.0.1'))(kernel);
    await queueProvider.boot();
    return (<any>assert).isRejected(
      queueProvider.call('nope', { add: [1, 2] }, { internal: true }),
      Error,
      'An error occured',
    );
  });
});

