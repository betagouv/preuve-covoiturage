import { coerceIntList } from "@/ilos/cli/index.ts";
import { command, CommandInterface, ContextType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
import { set } from "@/lib/object/index.ts";
import { CampaignRepository } from "@/pdc/providers/campaign/repositories/CampaignRepository.ts";
import { fromZonedTime } from "dep:date-fns-tz";
import { ParamsInterface as ExportParams, signature as exportSignature } from "../contracts/export.contract.ts";
import { castExportParams } from "../helpers/castExportParams.helper.ts";

const log = taggedLogger("[apdf]", { maxLength: 512 });

interface Options {
  campaigns: number[];
  start?: string;
  end?: string;
  operators?: number[];
  tz: string;
  verbose: boolean;
}

@command({
  signature: "apdf:export",
  description: "Export APDF",
  options: [
    {
      signature: "-c, --campaigns <campaigns>",
      description: "List of campaign/policy id separated by ,",
      coerce: coerceIntList,
      default: [],
    },
    {
      signature: "-o, --operators <operators>",
      description: "List of operators id separated by ,",
      coerce: coerceIntList,
    },
    {
      signature: "-s, --start <start>",
      description: "Start date (YYYY-MM-DD)",
      default: null,
    },
    {
      signature: "-e, --end <end>",
      description: "End date (YYYY-MM-DD)",
      default: null,
    },
    {
      signature: "--tz <tz>",
      description: "Output timezone",
      default: "Europe/Paris",
    },
    {
      signature: "--verbose",
      description: "Display CLI specific logger.info()",
    },
  ],
})
export class ExportCommand implements CommandInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    protected campaignsRepository: CampaignRepository,
  ) {}

  public async call(options: Options): Promise<string> {
    const params: Partial<ExportParams> = {
      format: { tz: options.tz },
    };

    const context: ContextType = {
      channel: { service: "apdf", transport: "cli" },
      call: {
        user: { permissions: ["registry.apdf.export"] },
        metadata: { verbose: options.verbose },
      },
    };

    if (options.start) {
      set(
        params,
        "query.date.start",
        fromZonedTime(options.start, options.tz).toISOString(),
      );
    }
    if (options.end) {
      set(
        params,
        "query.date.end",
        fromZonedTime(options.end, options.tz).toISOString(),
      );
    }
    if (options.operators?.length) {
      set(params, "query.operator_id", options.operators);
    }

    // fetch active campaigns at the given date
    const { start_date, end_date } = castExportParams(params as ExportParams);
    const campaign_list = options.campaigns.length
      ? options.campaigns
      : await this.campaignsRepository.findByRange(start_date, end_date);

    set(params, "query.campaign_id", campaign_list);

    log.info("running export", {
      signature: exportSignature,
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
      campaigns: campaign_list.join("."),
    });

    await this.kernel.call(exportSignature, params, context);

    return "";
  }
}
