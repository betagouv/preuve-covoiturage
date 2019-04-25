// tslint:disable no-invalid-this
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
    return call;
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
  async up() {
    return;
  },
  async down() {
    return;
  },
};

const sandbox = sinon.createSandbox();

describe('Queue provider', () => {
  beforeEach(() => {
    sandbox.stub(Bull, 'bullFactory').callsFake(
      // @ts-ignore
      name => ({
        name,
        async process(fn) { this.fn = fn; return; },
        async close() { return; },
        async add(call) {
          const fn = this.fn;
          return fn(call);
        },
      }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('works', async () => {
    const queueTransport = new QueueTransport(kernel, ['hello']);
    await queueTransport.up();
    expect(queueTransport.queues.length).to.equal(1);
    expect(queueTransport.queues[0].name).to.equal('prod-hello');
    const response = await queueTransport.queues[0].add({
      data: {
        id: null,
        jsonrpc: '2.0',
        method: 'myservice@latest:method',
        params: {
          params: {
            hello: 'world',
          },
          _context: {
            transport: 'http',
            user: 'me',
            internal: false,
          },
        },
      },
    });
    expect(response).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      method: 'myservice@latest:method',
      params: {
        params: {
          hello: 'world',
        },
        _context: {
          transport: 'queue',
          user: 'me',
          internal: false,
        },
      },
    });
    await queueTransport.down();
  });
});

