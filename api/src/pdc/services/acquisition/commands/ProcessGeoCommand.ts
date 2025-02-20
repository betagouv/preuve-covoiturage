import { coerceDate, coerceInt } from "@/ilos/cli/index.ts";
import { command, CommandInterface } from "@/ilos/common/index.ts";
import { getPerformanceTimer, logger } from "@/lib/logger/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { subDays } from "dep:date-fns";

type Options = {
  loop: boolean;
  size: number;
  after?: Date;
  until?: Date;
  lastDays: number;
  failed: boolean;
};

@command({
  signature: "acquisition:geo",
  description: "Process acquisition geo",
  options: [
    {
      signature: "-l, --loop",
      description: "Process acquisition while remaining",
      default: false,
    },
    {
      signature: "-s, --size <size>",
      description: "Batch size",
      coerce: coerceInt,
      default: 100,
    },
    {
      signature: "-a, --after <after>",
      description: "Start date",
      coerce: coerceDate,
    },
    {
      signature: "-u, --until <until>",
      description: "End date",
      coerce: coerceDate,
    },
    {
      signature: "-d, --last-days <days>",
      description: "Process x last days from now",
      default: 1,
      coerce: coerceInt,
    },
    {
      signature: "-f, --failed",
      description: "Process failed geo only",
      default: false,
    },
  ],
})
export class ProcessGeoCommand implements CommandInterface {
  protected readonly MAX_BATCH_SIZE = 10000;

  constructor(protected carpool: CarpoolAcquisitionService) {}

  public async call(opts: Options): Promise<void> {
    const options = this.validateOptions(opts);

    let shouldContinue = true;
    const timer = getPerformanceTimer();

    do {
      const subtimer = getPerformanceTimer();
      const did = await this.encode(options);
      const subperformance = subtimer.stop();
      logger.info(`Processed: ${did} in ${subperformance} ms`);
      shouldContinue = did === options.size;
    } while (shouldContinue && options.loop);

    const performance = timer.stop();
    logger.info(`Geo encoding done in ${performance} ms`);
  }

  protected async encode(options: Options): Promise<number> {
    return await this.carpool.processGeo({
      batchSize: options.size,
      failedOnly: options.failed,
      from: options.after ?? subDays(new Date(), options.lastDays),
      to: options.until ?? new Date(),
    });
  }

  protected validateOptions(opts: Options): Options {
    if (opts.after && opts.until && opts.after > opts.until) {
      throw new Error("Start date cannot be after end date");
    }

    if (opts.lastDays && opts.after) {
      throw new Error("Cannot use last days and start date at the same time");
    }

    if (opts.lastDays && opts.until) {
      throw new Error("Cannot use last days and end date at the same time");
    }

    if (opts.lastDays && opts.lastDays < 1) {
      throw new Error("Last days must be greater than 0");
    }

    if (opts.size && opts.size <= 1) {
      throw new Error("Batch size must be greater than 1");
    }

    if (opts.size && opts.size > this.MAX_BATCH_SIZE) {
      throw new Error(`${this.MAX_BATCH_SIZE} is a reasonable maximum batch size`);
    }

    return opts;
  }
}
