import {
  command,
  CommandInterface,
  CommandOptionType,
  ResultType,
  KernelInterfaceResolver,
  ContextType,
} from '@ilos/common';
import { signature } from '@shared/monitoring/statsrefresh.contract';

interface CommandOptions {
  schema: string;
}
@command()
export class StatsRefreshCommand implements CommandInterface {
  static readonly signature: string = 'monitoring:stats:refresh';
  static readonly description: string = 'Refresh stats materialized views';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-s, --schema <schema>',
      description: 'DB schema to refresh',
      default: 'stats',
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call({ schema }: CommandOptions): Promise<ResultType> {
    const context: ContextType = {
      channel: { service: 'proxy' },
      call: { user: {} },
    };

    console.info(`Running [monitoring:stats:refresh] for schema ${schema}`);
    await this.kernel.call(signature, { schema }, context);

    return '';
  }
}
