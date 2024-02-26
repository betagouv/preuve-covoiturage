import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';

@command()
export class AcquisitionProcessCommand implements CommandInterface {
  static readonly signature: string = 'acquisition:process';
  static readonly description: string = 'Import acquisition on carpool';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(): Promise<string> {
    await this.kernel.call('acquisition:process', {}, { channel: { service: 'acquisition' }, call: { user: {} } });

    return 'done';
  }
}
