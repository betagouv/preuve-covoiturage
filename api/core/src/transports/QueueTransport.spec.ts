import { describe } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';

import * as Bull from '../helpers/bullFactory';
import { QueueTransport } from './QueueTransport';

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
};

const sandbox = sinon.createSandbox();

describe('Queue provider', () => {
  beforeEach(() => {
    sandbox.stub(Bull, 'bullFactory').callsFake(name => ({
      name,
      async process(fn) { return; },
      async close() { return; },
    }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('works', async () => {
    const queueTransport = new QueueTransport(kernel, { services: ['hello'] });
    await queueTransport.up();
    expect(queueTransport.queues.length).to.equal(1);
    expect(queueTransport.queues[0].name).to.equal('prod-hello');
    await queueTransport.down();
  });
});

