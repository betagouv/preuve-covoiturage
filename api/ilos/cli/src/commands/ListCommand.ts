import { command, KernelInterfaceResolver, CommandOptionType } from '@ilos/common';

import { Command } from '../parents/Command';

/**
 * Command that list RPC methods
 * @export
 * @class CallCommand
 * @extends {Command}
 */
@command()
export class ListCommand extends Command {
  static readonly signature: string = 'list';
  static readonly description: string = 'List RPC methods';
  static readonly options: CommandOptionType[] = [];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async call(): Promise<string> {
    let result = '';
    const handlers = this.kernel.getContainer().getHandlers();

    const handlersByTransport = handlers.reduce((acc, h) => {
      const key = h.local ? 'local' : h.queue ? 'queue' : 'remote';
      if (!(key in acc)) {
        acc[key] = [];
      }
      acc[key].push(h);
      return acc;
    }, {});

    Reflect.ownKeys(handlersByTransport).forEach((key: string) => {
      result += `${key.toUpperCase()} : \n`;
      const handlersByService = handlersByTransport[key].reduce((acc, h) => {
        const keyVersion = `${h.service}@${h.version}`;
        if (!(keyVersion in acc)) {
          acc[keyVersion] = [];
        }
        acc[keyVersion].push(h);
        return acc;
      }, {});

      Reflect.ownKeys(handlersByService).forEach((serviceKey: string) => {
        result += `  - ${serviceKey}\n`;
        handlersByService[serviceKey].forEach((handler) => {
          result += `    * ${handler.method}\n`;
        });
      });
    });

    return result;
  }
}
