import { provider } from "@/ilos/common/index.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { logger } from "@/lib/logger/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
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
  TerritoriesWithCampaignParamsInterface,
  TerritoriesWithCampaignResultInterface,
} from "../interfaces/CampaignsRepositoryInterface.ts";

@provider({
  identifier: CampaignsRepositoryInterfaceResolver,
})
export class CampaignsRepository implements CampaignsRepositoryInterface {
  private readonly table = "policy.policies";
  private readonly tableIncentives = "policy.incentives";
  private readonly tableTerritory = "territory.territory_group";
  private bucket: BucketName = BucketName.APDF;

  constructor(
    private pgConnection: DenoPostgresConnection,
    private s3StorageProvider: S3StorageProvider,
    private APDFNameProvider: APDFNameProvider,
  ) {}

  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface[]> {
    const filters = [
      sql`a.territory_id = ${params.territory_id}`,
    ];
    if (params.operator_id) {
      filters.push(sql`c.operator_id = ${params.operator_id}`);
    }
    const query = sql`
      SELECT ${params.operator_id ? sql`DISTINCT` : sql``}
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
      FROM ${raw(this.table)} a
      LEFT JOIN ${raw(this.tableTerritory)} b on a.territory_id = b._id
      ${params.operator_id ? sql`LEFT JOIN ${raw(this.tableIncentives)} c on a._id = c.policy_id` : sql``}
      ${filters.length > 0 ? sql`WHERE ${join(filters, ` AND `)}` : sql``}
      ORDER BY 9, 2 desc 
    `;
    const rows = await this.pgConnection.query<CampaignsResultInterface>(query);
    return rows;
  }

  async getTerritoriesWithCampaign(
    params: TerritoriesWithCampaignParamsInterface,
  ): Promise<TerritoriesWithCampaignResultInterface[]> {
    const filters = [];
    if (params.operator_id) {
      filters.push(sql`c.operator_id = ${params.operator_id}`);
    }
    const query = sql`
      SELECT DISTINCT
        a.territory_id as id,
        b.name as name 
      FROM ${raw(this.table)} a
      LEFT JOIN ${raw(this.tableTerritory)} b on a.territory_id = b._id
      ${params.operator_id ? sql`LEFT JOIN ${raw(this.tableIncentives)} c on a._id = c.policy_id` : sql``}
      ${filters.length > 0 ? sql`WHERE ${join(filters, ` AND `)}` : sql``}
      ORDER BY 2 
    `;
    const rows = await this.pgConnection.query<TerritoriesWithCampaignResultInterface>(query);
    return rows;
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
      if (e instanceof Error) {
        logger.error(`[Apdf:StorageRepo:findByCampaign] ${e.message}`);
      } else {
        logger.error(`[Apdf:StorageRepo:findByCampaign]`, e);
      }
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
