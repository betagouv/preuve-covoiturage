import { coerceDate } from "@/ilos/cli/index.ts";
import { command, CommandInterface } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { today, toTzString } from "@/pdc/helpers/dates.helper.ts";
import { Timezone } from "@/pdc/providers/validator/index.ts";
import { CSVWriter } from "@/pdc/services/export/models/CSVWriter.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { NotificationService } from "@/pdc/services/export/services/NotificationService.ts";
import { StorageService } from "@/pdc/services/export/services/StorageService.ts";
import { ExportTarget } from "../models/Export.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";
import { CarpoolDataGouvListType } from "../repositories/queries/CarpoolDataGouvQuery.ts";
import { DataGouvFileCreatorServiceInterfaceResolver } from "../services/DataGouvFileCreatorService.ts";
import { FieldServiceInterfaceResolver } from "../services/FieldService.ts";
import { LogServiceInterfaceResolver } from "../services/LogService.ts";
import { NameServiceInterfaceResolver } from "../services/NameService.ts";

export type Options = {
  start: Date;
  end: Date;
  tz: Timezone;
};

function defaultDate(offset = 0): Date {
  const now = today();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
}

@command({
  signature: "export:datagouv",
  description: "Export file and upload to data.gouv.fr",
  options: [
    {
      signature: "-s, --start <start>",
      description: "Start date (YYYY-MM-DD)",
      coerce: coerceDate,
      default: defaultDate(-1),
    },
    {
      signature: "-e, --end <end>",
      description: "End date (YYYY-MM-DD)",
      coerce: coerceDate,
      default: defaultDate(0),
    },
    {
      signature: "--tz <tz>",
      description: "Output timezone",
      default: "Europe/Paris",
    },
  ],
})
export class DataGouvCommand implements CommandInterface {
  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected fileCreatorService: DataGouvFileCreatorServiceInterfaceResolver,
    protected fieldService: FieldServiceInterfaceResolver,
    protected nameService: NameServiceInterfaceResolver,
    protected logger: LogServiceInterfaceResolver,
    protected storage: StorageService,
    protected notify: NotificationService,
  ) {}

  public async call(options: Options): Promise<void> {
    // 1. Get and configure parameters
    // 2. Export the file
    // 3. FileCreator
    // 4. Build data.gouv.fr Metadata
    // 5. Upload the resource to data.gouv.fr

    // TODO notify users of the end of the process

    const chunks = this.splitByMonth(options.start, options.end, options.tz);
    const target = ExportTarget.DATAGOUV;
    const fields = this.fieldService.byTarget<CarpoolDataGouvListType>(target);

    for (const params of chunks) {
      const filename = this.nameService.datagouv(params.get().start_at);

      const s = toTzString(params.get().start_at, "Europe/Paris", "yyyy-MM");
      const e = toTzString(params.get().end_at, "Europe/Paris", "yyyy-MM");
      logger.info(`Exporting ${filename} from ${s} to ${e}`);

      await this.fileCreatorService.write(
        params,
        new CSVWriter<CarpoolDataGouvListType>(filename, { tz: options.tz, compress: false, fields }),
      );

      // upload to storage
    }
  }

  private splitByMonth(start: Date, end: Date, tz: Timezone): ExportParams[] {
    const start_at = new Date(start.getFullYear(), start.getMonth(), 1);
    const end_at = new Date(end.getFullYear(), end.getMonth(), 1);
    const months: ExportParams[] = [];

    if (start_at >= end_at) {
      logger.error("Invalid date range. Defaults applied");

      return [ExportParams.fromJSON({
        start_at: defaultDate(-1),
        end_at: defaultDate(0),
        tz,
      })];
    }

    while (start_at < end_at) {
      const next = new Date(start_at);
      next.setMonth(next.getMonth() + 1);
      months.push(ExportParams.fromJSON({ start_at, end_at: next, tz }));
      start_at.setMonth(start_at.getMonth() + 1);
    }

    return months;
  }
}
