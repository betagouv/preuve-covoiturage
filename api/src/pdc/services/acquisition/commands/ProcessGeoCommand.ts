import { subDays } from "@/deps.ts";
import { coerceDate, coerceInt } from "@/ilos/cli/index.ts";
import { command, CommandInterface } from "@/ilos/common/index.ts";
import { getPerformanceTimer, logger } from "@/lib/logger/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";

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
      description: "end date",
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
  constructor(protected carpool: CarpoolAcquisitionService) {}

  public async call(options): Promise<string> {
    let shouldContinue = true;

    const batchSize = options.size;
    const timer = getPerformanceTimer();
    do {
      const subtimer = getPerformanceTimer();
      const did = await this.encode(
        batchSize,
        options.failed,
        options.after ?? subDays(new Date(), options.lastDays),
        options.until ?? new Date(),
      );
      const subperformance = subtimer.stop();
      logger.info(`Processed: ${did} in ${subperformance} ms`);
      shouldContinue = did === batchSize;
    } while (shouldContinue && options.loop);

    const performance = timer.stop();
    logger.info(`Geo encoding done in ${performance} ms`);
    return "done";
  }

  protected async encode(
    batchSize = 100,
    failedOnly: boolean,
    after?: Date,
    until?: Date,
  ): Promise<number> {
    return await this.carpool.processGeo({
      batchSize,
      failedOnly,
      from: after,
      to: until,
    });
  }
}
