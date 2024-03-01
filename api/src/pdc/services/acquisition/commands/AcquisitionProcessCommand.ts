import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';

@command()
export class AcquisitionProcessCommand implements CommandInterface {
  static readonly signature: string = 'acquisition:process';
  static readonly description: string = 'Import acquisition on carpool';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-l, --loop',
      description: 'Process acquisition while remaining',
      default: false,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(options): Promise<string> {
    let shouldContinue = true;

    do {
      shouldContinue = await this.kernel.call('acquisition:process', {}, { channel: { service: 'acquisition' }, call: { user: {} } });
    } while(shouldContinue && options.loop)

    return 'done';
  }
}
