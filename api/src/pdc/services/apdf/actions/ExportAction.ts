import { ConfigInterfaceResolver, ContextType, handler, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { get } from "@/lib/object/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { BucketName, S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { unlink } from "dep:fs-promises";
import { ResultInterface as PolicyResultInterface } from "../../policy/contracts/find.contract.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/export.contract.ts";
import { alias } from "../contracts/export.schema.ts";
import { castExportParams } from "../helpers/castExportParams.helper.ts";
import { getCampaignOperators } from "../helpers/getCampaignOperators.helper.ts";
import { DataRepositoryProviderInterfaceResolver } from "../interfaces/APDFRepositoryProviderInterface.ts";
import { CheckCampaign } from "../providers/CheckCampaign.ts";
import { BuildExcel } from "../providers/excel/BuildExcel.ts";

const log = taggedLogger("[apdf]");

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares("apdf"), ["validate", alias]],
})
export class ExportAction extends Action {
  constructor(
    private kernel: KernelInterfaceResolver,
    private checkCampaign: CheckCampaign,
    private s3StorageProvider: S3StorageProvider,
    private apdfRepositoryProvider: DataRepositoryProviderInterfaceResolver,
    private buildExcel: BuildExcel,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { start_date, end_date } = castExportParams(params);
    const verbose = this.isVerbose(context);

    if (verbose) {
      log.debug("exporting", { start_date: start_date.toISOString(), end_date: end_date.toISOString() });
    }

    const files: string[] = [];
    await Promise.all(
      params.query.campaign_id.map(async (c_id) => {
        // Make sure the campaign is active and within the date range
        const campaign: string | PolicyResultInterface = await this.checkCampaign
          .call(c_id, start_date, end_date)
          .catch((e) => log.error("check campaign failed", { campaign_id: c_id, error: errorCode(e) }));

        if (!campaign || typeof campaign !== "object") return;

        // Get declared operators
        const operators = await getCampaignOperators(this.kernel, handlerConfig.service, campaign._id);

        // List operators having subsidized trips and filter them by the ones declared
        // in the policy file (policy/src/engine/policies/<policy.ts>).
        // Bypass when the declared list is empty.
        const activeOperatorIds = (
          params.query.operator_id ||
          (await this.apdfRepositoryProvider.getPolicyActiveOperators(campaign._id, start_date, end_date))
        ).filter((operator_id) => (operators.length ? operators.includes(operator_id) : true));

        if (!activeOperatorIds.length) {
          log.info("no active operators", { campaign_id: campaign._id });
        }

        if (verbose) {
          log.debug("building campaign", {
            campaign_id: campaign._id,
            start_date: campaign.start_date.toISOString(),
            end_date: campaign.end_date.toISOString(),
            used_eur: campaign.incentive_sum / 100,
            declared: operators.join("."),
            operators: activeOperatorIds.join("."),
          });
        }

        // Generate XLSX files for each operator and upload to S3 storage
        await Promise.all(
          activeOperatorIds.map(async (o_id) => {
            try {
              log.debug("building file", { campaign_id: campaign._id, operator_id: o_id });
              const { filename, filepath } = await this.buildExcel.call(campaign, start_date, end_date, o_id);

              if (this.config.get("apdf.s3UploadEnabled") === false) {
                log.warn("upload disabled", { campaign_id: campaign._id, operator_id: o_id });
                return;
              }

              const file = await this.s3StorageProvider.upload(
                BucketName.APDF,
                filepath,
                filename,
                `${campaign._id}`,
              );

              // maybe delete the file
              try {
                await unlink(filepath);
              } catch (_e) {
                log.warn("unlink failed", { campaign_id: campaign._id, operator_id: o_id });
              }

              files.push(file);
            } catch (e) {
              const message = `[apdf:export] (campaign: ${campaign.name}, operator_id: ${o_id}) Export failed`;
              log.error("export failed", { campaign_id: campaign._id, operator_id: o_id, error: errorCode(e) });
              files.push(message);
            }
          }),
        );
      }),
    );

    return files;
  }

  private isVerbose(context: ContextType): boolean {
    return Boolean(get(context, "channel.transport") === "cli" && get(context, "call.metadata.verbose", false));
  }
}
