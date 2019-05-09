// tslint:disable no-invalid-this
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { CallCommand } from './CallCommand';
import { Kernel } from '../parents/Kernel';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

class FakeKernel extends Kernel {
  async boot() { return; }
  async handle(call) {
    if (call.method === 'nope') {
      throw new Error();
    }
    return call;
  }
}

const kernel = new FakeKernel();

describe('Command: Call', () => {
  it('should work', async () => {
    const command = new CallCommand(kernel);
    const response = await command.call('method');
    expect(response).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      method: 'method',
      params: {
        _context: {
          channel: {
            service: '',
            transport: 'cli',
          },
        },
        params: undefined,
      },
    });
  });
  it('should work with options', async () => {
    const command = new CallCommand(kernel);
    const response = await command.call('method', { params: [1, 2], context: { call: { user: 'michou' } } });
    expect(response).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      method: 'method',
      params: {
        _context: {
          channel: {
            service: '',
            transport: 'cli',
          },
          call: {
            user: 'michou',
          },
        },
        params: [1, 2],
      },
    });
  });

  it('should throw exception on error', () => {
    const command = new CallCommand(kernel);
    return (<any>assert).isRejected(command.call('nope'));
  });
});
