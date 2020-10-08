import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';

@command()
export class JourneysStatsCommand implements CommandInterface {
  static readonly signature: string = 'stats:journeys';
  static readonly description: string = 'Stats on journeys';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<string> {
    console.log('Gathering stats...');

    const response = await this.kernel.call(
      'monitoring:journeysstats',
      {},
      { channel: { service: 'monitoring' }, call: { user: { permissions: ['monitoring.journeysstats'] } } },
    );

    return response;
  }
}
