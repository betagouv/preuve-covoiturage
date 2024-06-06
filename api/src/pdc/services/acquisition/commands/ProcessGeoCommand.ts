import { command, CommandInterface, CommandOptionType } from '@/ilos/common/index.ts';
import { CarpoolAcquisitionService } from '@/pdc/providers/carpool/index.ts';
import { coerceDate, coerceInt } from '@/ilos/cli/index.ts';
import { subDays } from 'date-fns';

@command()
export class ProcessGeoCommand implements CommandInterface {
  static readonly signature: string = 'acquisition:geo';
  static readonly description: string = 'Process acquisition geo';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-l, --loop',
      description: 'Process acquisition while remaining',
      default: false,
    },
    {
      signature: '-s, --size <size>',
      description: 'Batch size',
      coerce: coerceInt,
      default: 100,
    },
    {
      signature: '-a, --after <after>',
      description: 'Start date',
      coerce: coerceDate,
    },
    {
      signature: '-u, --until <until>',
      description: 'end date',
      coerce: coerceDate,
    },
    {
      signature: '-d, --last-days <days>',
      description: 'Process x last days from now',
      default: 1,
      coerce: coerceInt,
    },
    {
      signature: '-f, --failed',
      description: 'Process failed geo only',
      default: false,
    },
  ];

  constructor(protected carpool: CarpoolAcquisitionService) {}

  public async call(options): Promise<string> {
    let shouldContinue = true;

    const batchSize = options.size;
    const timerMessage = `Encoding carpool geo`;
    console.time(timerMessage);

    do {
      const did = await this.encode(
        batchSize,
        options.failed,
        options.after ?? subDays(new Date(), options.lastDays),
        options.until ?? new Date(),
      );
      console.timeLog(timerMessage);
      console.info(`Processed: ${did}`);
      shouldContinue = did === batchSize;
    } while (shouldContinue && options.loop);

    console.timeEnd(timerMessage);
    return 'done';
  }

  protected async encode(batchSize = 100, failedOnly: boolean, after?: Date, until?: Date): Promise<number> {
    return await this.carpool.processGeo({ batchSize, failedOnly, from: after, to: until });
  }
}
