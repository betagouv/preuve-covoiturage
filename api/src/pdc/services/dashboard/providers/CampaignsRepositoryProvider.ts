import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { logger } from "@/lib/logger/index.ts";
import {
  APDFNameProvider,
  BucketName,
  S3Object,
  S3ObjectList,
  S3StorageProvider,
} from "@/pdc/providers/storage/index.ts";
import {
  CampaignApdfParamsInterface,
  CampaignApdfResultInterface,
  CampaignsParamsInterface,
  CampaignsRepositoryInterface,
  CampaignsRepositoryInterfaceResolver,
  CampaignsResultInterface,
} from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";

@provider({
  identifier: CampaignsRepositoryInterfaceResolver,
})
export class CampaignsRepositoryProvider implements CampaignsRepositoryInterface {
  private readonly table = "policy.policies";
  private readonly tableTerritory = "territory.territory_group";
  private bucket: BucketName = BucketName.APDF;

  constructor(
    private pg: PostgresConnection,
    private s3StorageProvider: S3StorageProvider,
    private APDFNameProvider: APDFNameProvider,
  ) {}

  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    const queryValues: (string | number)[] = [];
    const conditions = [];
    if (params.territory_id) {
      queryValues.push(params.territory_id);
      conditions.push(`territory_id = $1`);
    }

    const queryText = `
      SELECT 
        a._id AS id,
        to_char(a.start_date, 'YYYY-MM-DD') AS start_date,
        to_char(a.end_date, 'YYYY-MM-DD') AS end_date,
        a.territory_id,
        b.name as territory_name,
        a.name,
        a.description,
        a.unit,
        a.status,
        a.handler,
        a.incentive_sum::int,
        a.max_amount::int
      FROM ${this.table} a
      LEFT JOIN ${this.tableTerritory} b on a.territory_id = b._id
      ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY a.start_date desc
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  async getCampaignApdf(
    params: CampaignApdfParamsInterface,
  ): Promise<CampaignApdfResultInterface> {
    try {
      const list = await this.s3StorageProvider.list(
        this.bucket,
        `${params.campaign_id}`,
      );
      return await this.enrichApdf(list.filter((obj) => obj.size > 0));
    } catch (e) {
      logger.error(`[Apdf:StorageRepo:findByCampaign] ${e.message}`);
      logger.debug(e.stack);
      throw e;
    }
  }

  async enrichApdf(list: S3ObjectList): Promise<CampaignApdfResultInterface> {
    return Promise.all(
      list.map(async (o: S3Object) => ({
        ...this.APDFNameProvider.parse(o.key),
        signed_url: await this.s3StorageProvider.getSignedUrl(
          this.bucket,
          o.key,
          S3StorageProvider.TEN_MINUTES,
        ),
        key: o.key,
        size: o.size,
      })),
    );
  }
}
