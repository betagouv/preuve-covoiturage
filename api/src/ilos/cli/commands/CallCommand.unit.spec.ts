import { describe, it, assertObjectMatch, assertRejects } from "@/test_deps.ts";
import { Kernel } from '@/ilos/core/index.ts';

import { CallCommand } from './CallCommand.ts';
import { RPCSingleCallType, RPCSingleResponseType } from "@/ilos/common/index.ts";

function setup() {
  class FakeKernel extends Kernel {
    async bootstrap() {
      return;
    }
    async handle(call: RPCSingleCallType): Promise<RPCSingleResponseType> {
      if (call.method === 'nope') {
        throw new Error('This is not working');
      }
      return { ...call } as unknown as RPCSingleResponseType;
    }
  }

  const kernel = new FakeKernel();
  const command = new CallCommand(kernel);

  return { kernel, command };
}

describe('command', () => {
  it('Command "call": should work', async () => {
    const { command } = setup();
    const response = await command.call('method');
    assertObjectMatch(response, {
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

  it('Command "call": should work with options', async () => {
    const { command } = setup();
    const response = await command.call('method', { params: [1, 2], context: { call: { user: 'michou' } } });
    assertObjectMatch(response, {
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

  it('Command "call": should throw exception on error', async () => {
    const { command } = setup();
    await assertRejects(async () => await command.call('nope'), 'This is not working');
  });
});
