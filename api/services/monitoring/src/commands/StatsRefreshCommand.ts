import {
  command,
  CommandInterface,
  CommandOptionType,
  ResultType,
  KernelInterfaceResolver,
  ContextType,
} from '@ilos/common';
import { signature } from '../shared/monitoring/statsrefresh.contract';

interface CommandOptions {
  schema: string;
  sync: boolean;
}
@command()
export class StatsRefreshCommand implements CommandInterface {
  static readonly signature: string = 'stats:refresh';
  static readonly description: string = 'Refresh stats materialized views';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-s, --schema <schema>',
      description: 'DB schema to refresh',
      default: 'stats',
    },
    {
      signature: '--sync',
      description: 'Run the command without the queue',
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call({ schema, sync }: CommandOptions): Promise<ResultType> {
    const context: ContextType = {
      channel: { service: 'proxy' },
      call: { user: {} },
    };

    if (sync) {
      console.info(`Running [stats:refresh] in sync for schema ${schema}`);
      await this.kernel.call(signature, { schema }, context);
    } else {
      console.info(`Pushed [stats:refresh] to the queue for schema ${schema}`);
      await this.kernel.notify(signature, { schema }, context);
    }

    return '';
  }
}
