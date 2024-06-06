import { command, ResultType, CommandOptionType } from '/ilos/common/index.ts';
import { KernelInterfaceResolver } from '/ilos/common/index.ts';

import { Command } from '../parents/Command.ts';

function coerceToJson(s: string): object {
  try {
    if ('string' !== typeof s) return {};
    if (!s.length) return {};
    return JSON.parse(s);
  } catch (e) {
    console.error(e.message);
    return {};
  }
}

/**
 * Command that make an RPC call
 * @export
 * @class CallCommand
 * @extends {Command}
 */
@command()
export class CallCommand extends Command {
  static readonly signature: string = 'call <method>';
  static readonly description: string = 'Make an RPC call';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-p, --params <params>',
      description: 'Set call parameters',
      default: {},
      coerce: coerceToJson,
    },
    {
      signature: '-c, --context <context>',
      description: 'Set call context',
      default: {},
      coerce: coerceToJson,
    },
  ];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async call(method, options?): Promise<ResultType> {
    const call = {
      method,
      jsonrpc: '2.0',
      id: 1,
      params: {
        params: undefined,
        _context: {
          channel: {
            service: '',
            transport: 'cli',
          },
        },
      },
    };

    if (options && ('params' in options || 'context' in options)) {
      if ('params' in options) {
        call.params.params = options.params;
      }

      if ('context' in options) {
        call.params._context = options.context;
        call.params._context.channel = {
          transport: 'cli',
          service: '',
          ...options.context.channel,
        };
      }
    }

    const response = await this.kernel.handle(call);
    return response;
  }
}
