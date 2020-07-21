import test from 'ava';
import { Kernel } from '@ilos/core';

import { CallCommand } from './CallCommand';

function setup() {
  class FakeKernel extends Kernel {
    async bootstrap() {
      return;
    }
    async handle(call) {
      if (call.method === 'nope') {
        throw new Error('This is not working');
      }
      return call;
    }
  }

  const kernel = new FakeKernel();
  const command = new CallCommand(kernel);

  return { kernel, command };
}

test('Command "call": should work', async (t) => {
  const { command } = setup();
  const response = await command.call('method');
  t.deepEqual(response, {
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

test('Command "call": should work with options', async (t) => {
  t.plan(1);
  const { command } = setup();
  const response = await command.call('method', { params: [1, 2], context: { call: { user: 'michou' } } });
  t.deepEqual(response, {
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

test('Command "call": should throw exception on error', async (t) => {
  t.plan(2);
  const { command } = setup();
  const err = await t.throwsAsync<Error>(async () => command.call('nope'));
  t.is(err.message, 'This is not working');
});
