import { KernelInterface } from '~/interfaces/KernelInterface';

import { Command } from '../parents/Command';
import { CommandOptionType } from '../types/CommandOptionType';
import { ResultType } from '../types/ResultType';

export class CallCommand extends Command {
  public readonly signature: string = 'call <method>';
  public readonly description: string = 'Make an RPC call';
  public readonly options: CommandOptionType[] = [
    {
      signature: '-p, --params <params>',
      description: 'Set call parameters',
      coerce: val => JSON.parse(val),
    },
    {
      signature: '-c, --context <context>',
      description: 'Set call context',
      coerce: val => JSON.parse(val),
    },
  ];

  constructor(
    private kernel: KernelInterface,
  ) {
    super();
  }

  public async call(method, options?):Promise<ResultType> {
    try {
      const call = {
        method,
        jsonrpc: '2.0',
        id: 1,
        params: {
          params: undefined,
          _context: {
            transport: 'cli',
          },
        },
      };

      if (options && ('params' in options || 'context' in options)) {
        if ('params' in options) {
          call.params.params = options.params;
        }

        if ('context' in options) {
          call.params._context = {
            ...options.context,
            ...call.params._context,
          };
        }
      }

      const response = await this.kernel.handle(call);
      return response;
    } catch (e) {
      throw e;
    }
  }
}
