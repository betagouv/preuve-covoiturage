import {
  ContextType,
  handler,
  InvalidParamsException,
} from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import {
  handlerConfigV3,
  ParamsInterfaceV3,
  ResultInterfaceV3,
} from "@/shared/export/create.contract.ts";
import { Export } from "../models/Export.ts";
import { ExportParams } from "../models/ExportParams.ts";
import { ExportRecipient } from "../models/ExportRecipient.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";
import { RecipientServiceInterfaceResolver } from "../services/RecipientService.ts";
import { TerritoryServiceInterfaceResolver } from "../services/TerritoryService.ts";

@handler({
  ...handlerConfigV3,
  middlewares: [
    // hasPermissionMiddleware("common.export.create"),
    // castToArrayMiddleware(["operator_id", "territory_id", "recipients"]),
    // ["timezone", DefaultTimezoneMiddleware],
    // copyFromContextMiddleware(`call.user._id`, "created_by", true),
    // copyFromContextMiddleware(`call.user.operator_id`, "operator_id", true),
    // copyFromContextMiddleware(`call.user.territory_id`, "territory_id", true),
    // validateDateMiddleware({
    //   startPath: "start_at",
    //   endPath: "end_at",
    //   minStart: () => new Date(new Date().getTime() - minStartDefault),
    //   maxEnd: () => new Date(new Date().getTime() - maxEndDefault),
    // }),
    // ["validate", aliasV3],
  ],
})
export class CreateActionV3 extends AbstractAction {
  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected territoryService: TerritoryServiceInterfaceResolver,
    protected recipientService: RecipientServiceInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: ParamsInterfaceV3,
    context: ContextType,
  ): Promise<ResultInterfaceV3> {
    const paramTarget = Export.target(context);

    // make sure we have at least one recipient
    const emails = await this.recipientService.maybeAddCreator(
      (params.recipients || []).map(ExportRecipient.fromEmail),
      params.created_by,
    );

    if (!emails.length) {
      throw new InvalidParamsException(
        'No recipient found! You must set "created_by" or "recipients"',
      );
    }

    // Create the export request
    const {
      uuid,
      target,
      status,
      params: createParams,
    } = await this.exportRepository.create({
      created_by: params.created_by,
      target: paramTarget,
      recipients: emails,
      params: new ExportParams({
        tz: params.tz,
        start_at: params.start_at,
        end_at: params.end_at,
        operator_id: params.operator_id,
        geo_selector: params.geo_selector,
      }),
    });

    return {
      uuid,
      target,
      status,
      start_at: createParams.get().start_at,
      end_at: createParams.get().end_at,
    };
  }
}
