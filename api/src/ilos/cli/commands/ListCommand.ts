import {
  command,
  CommandOptionType,
  KernelInterfaceResolver,
} from "@/ilos/common/index.ts";
import { Command } from "../parents/Command.ts";

/**
 * Command that list RPC methods
 * @export
 * @class CallCommand
 * @extends {Command}
 */
@command()
export class ListCommand extends Command {
  static readonly signature: string = "list";
  static readonly description: string = "List RPC methods";
  static readonly options: CommandOptionType[] = [];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async call(): Promise<string> {
    let result = "";
    const handlers = this.kernel.getContainer().getHandlers();

    const handlersByTransport = handlers.reduce((acc, h) => {
      const key = h.local ? "local" : h.queue ? "queue" : "remote";
      if (!(key in acc)) {
        acc[key] = [];
      }
      acc[key].push(h);
      return acc;
    }, {} as any);

    Reflect.ownKeys(handlersByTransport).forEach((key: string | symbol) => {
      const k = String(key);
      result += `${k.toUpperCase()} : \n`;
      const handlersByService = handlersByTransport[k].reduce(
        (acc: any, h: any) => {
          const keyVersion = `${h.service}@${h.version}`;
          if (!(keyVersion in acc)) {
            acc[keyVersion] = [];
          }
          acc[keyVersion].push(h);
          return acc;
        },
        {},
      );

      Reflect.ownKeys(handlersByService).forEach(
        (serviceKey: string | symbol) => {
          result += `  - ${String(serviceKey)}\n`;
          handlersByService[serviceKey].forEach((handler: any) => {
            result += `    * ${handler.method}\n`;
          });
        },
      );
    });

    return result;
  }
}
