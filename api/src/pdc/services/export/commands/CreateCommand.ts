import { coerceDate } from "@/ilos/cli/index.ts";
import { command, CommandInterface } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { Timezone } from "@/pdc/providers/validator/index.ts";
import { ExportTarget } from "../models/Export.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { ExportRecipient } from "../models/ExportRecipient.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";
import { RecipientServiceInterfaceResolver } from "../services/RecipientService.ts";
import { TerritoryServiceInterfaceResolver } from "../services/TerritoryService.ts";

export type Options = {
  created_by: number;
  operator_id: number[];
  territory_id: number[];
  recipient: string[];
  target: ExportTarget;
  geo: string[];
  start: Date;
  end: Date;
  tz: Timezone;
};

@command({
  signature: "export:create",
  description: "Create an export request",
  options: [
    {
      signature: "-c, --created_by <created_by>",
      description: "User id",
      default: 0,
      coerce(value: string): number {
        return parseInt(value, 10);
      },
    },
    {
      signature: "-r, --recipient [recipient...]",
      description: '[repeatable] Recipient email ("fullname <email>" or "email" format)',
      default: [],
    },
    {
      signature: "-o, --operator_id [operator_id...]",
      description: "[repeatable] Operator id",
      default: [],
    },
    {
      signature: "--target <target>",
      description: "Select which fields to export (territory*, operator)",
      default: ExportTarget.TERRITORY,
      coerce(value: string): ExportTarget {
        if (Object.values(ExportTarget).includes(value as ExportTarget)) {
          return value as ExportTarget;
        }

        logger.warn(`Invalid target: ${value}, using default: ${ExportTarget.TERRITORY}`);
        return ExportTarget.TERRITORY;
      },
    },
    {
      signature: "-t, --territory [territory_id...]",
      description: "[repeatable] Territory id",
      default: [],
    },
    {
      signature: "-g --geo <geo...>",
      description: "[repeatable] Geo selector <type>:<code> (types: aom, com, epci, dep, reg)",
      default: [],
    },
    {
      signature: "-s, --start <start>",
      description: "Start date (YYYY-MM-DD)",
      default: null,
      coerce: coerceDate,
    },
    {
      signature: "-e, --end <end>",
      description: "End date (YYYY-MM-DD)",
      default: null,
      coerce: coerceDate,
    },
    {
      signature: "--tz <tz>",
      description: "Output timezone",
      default: "Europe/Paris",
    },
  ],
})
export class CreateCommand implements CommandInterface {
  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected territoryService: TerritoryServiceInterfaceResolver,
    protected recipientService: RecipientServiceInterfaceResolver,
  ) {}

  public async call(options: Options): Promise<void> {
    const {
      created_by,
      recipient: recipients,
      operator_id,
      geo,
      start: start_at,
      end: end_at,
      tz,
      target: optionTarget,
    } = options;

    // make sure we have at least one recipient
    const emails = await this.recipientService.maybeAddCreator(
      recipients.map(ExportRecipient.fromEmail),
      created_by,
    );
    if (!emails.length) {
      logger.error('No recipient found! You must set "--created_by" or "--recipient"');
      return;
    }

    const geo_selector = this.territoryService.geoStringToObject(geo);

    const { uuid, target, status, params } = await this.exportRepository.create(
      {
        created_by,
        target: optionTarget,
        recipients: emails,
        params: new ExportParams({
          start_at,
          end_at,
          operator_id: operator_id.map((s) => parseInt(s as unknown as string, 10)),
          // TODO add support for the territory_id (territory_group._id)
          // TODO add support for the SIREN to select the territory
          geo_selector: await this.territoryService.resolve({ geo_selector }),
          tz,
          target: optionTarget,
        }),
      },
    );

    logger.info(`Export request created!
      UUID: ${uuid}
      Target: ${target}
      Status: ${status}
      From: ${params.get().start_at} to ${params.get().end_at}
    `);
  }
}
