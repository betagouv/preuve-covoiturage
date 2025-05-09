import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/DenoPostgresConnection.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/LegacyPostgresConnection.ts";
import { logger } from "@/lib/logger/index.ts";
import sql from "@/lib/pg/sql.ts";
import { CarpoolAcquisitionStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { CSVWriter } from "@/pdc/services/export/models/CSVWriter.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { ExportProgress } from "@/pdc/services/export/repositories/ExportRepository.ts";
import { carpoolListQuery, CarpoolListType } from "@/pdc/services/export/repositories/queries/carpoolListQuery.ts";
import { IncentiveStatusEnum } from "@/pdc/services/policy/interfaces/index.ts";
import { dataGouvListQuery, DataGouvListType } from "./queries/datagouvListQuery.ts";
import { datagouvStatsQuery, DataGouvStatsType } from "./queries/datagouvStatsQuery.ts";

export abstract class CarpoolRepositoryInterfaceResolver {
  public async list(params: ExportParams, fileWriter: CSVWriter<CarpoolListType>): Promise<void> {
    throw new Error("Not implemented");
  }
  public async listCount(params: ExportParams): Promise<number> {
    throw new Error("Not implemented");
  }
  public async dataGouvList(params: ExportParams, fileWriter: CSVWriter<DataGouvListType>): Promise<void> {
    throw new Error("Not implemented");
  }
  public async dataGouvStats(params: ExportParams): Promise<DataGouvStatsType> {
    throw new Error("Not implemented");
  }
}

export type DataGouvQueryConfig = {
  min_occurrences: number;
  acquisition_status: CarpoolAcquisitionStatusEnum;
  incentive_status: IncentiveStatusEnum;
};

@provider({
  identifier: CarpoolRepositoryInterfaceResolver,
})
export class CarpoolRepository {
  public readonly table = "carpool_v2.carpools";
  private readonly batchSize = 1000;
  private readonly datagouvConfig: DataGouvQueryConfig = {
    min_occurrences: 6,
    acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
    incentive_status: IncentiveStatusEnum.Validated,
  };

  constructor(
    public legacyConnection: LegacyPostgresConnection,
    protected pgConnection: DenoPostgresConnection,
    protected config: ConfigInterfaceResolver,
  ) {}

  /**
   * List carpools for the general exports
   */
  public async list(
    params: ExportParams,
    fileWriter: CSVWriter<CarpoolListType>,
    progress?: ExportProgress,
  ): Promise<void> {
    try {
      // use a cursor to loop over the entire set of results
      // by chunks of N rows.

      const total = await this.listCount(params); // total number of rows
      logger.info(`[export:CarpoolRepository] Exporting ${total} rows`);

      let done = 0; // track the number of rows read
      let count = 0; // number of rows read in the current batch

      await using cursor = await this.pgConnection.cursor<CarpoolListType>(carpoolListQuery(params));

      for await (const rows of cursor.read(this.batchSize)) {
        console.log(`[export:CarpoolRepository] Fetching ${this.batchSize} rows`);
        // const { rows } = await client.queryObject<CarpoolListType>(`FETCH FORWARD ${this.batchSize} FROM mycursor`);
        // const rows = await cursor.read(this.batchSize);
        count = rows.length;
        done += count;
        console.log(`[export:CarpoolRepository] Read ${done} rows`);

        // pass each line to the file writer
        // for (const row of rows) {
        //   await fileWriter.append(new CarpoolRow<CarpoolListType>(row));
        // }

        if (progress) await progress(((done / total) * 100) | 0);
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[export:CarpoolRepository] ${e.message}`);
      } else {
        logger.error(`[export:CarpoolRepository] Unknown error`);
      }
      throw e;
      // } finally {
      //   cursor && await cursor.release();
    }
  }

  /**
   * Count the number of carpools for the general exports
   */
  public async listCount(params: ExportParams): Promise<number> {
    const rows = await this.pgConnection.query<{ count: string }>(sql`SELECT 1 AS count`);
    return Number.parseInt(rows[0].count, 10);
  }

  /**
   * List carpools with specific filtering for the open data requirements
   */
  public async dataGouvList(params: ExportParams, fileWriter: CSVWriter<DataGouvListType>): Promise<void> {
    try {
      // let count = 0;
      const query = dataGouvListQuery(params, this.datagouvConfig);
      await using cursor = await this.pgConnection.cursor(query);

      for await (const rows of cursor.read(this.batchSize)) {
        // const rows = await cursor.read(this.batchSize);
        // count = rows.length;
        // for (const row of rows) {
        //   await fileWriter.append(new CarpoolRow<DataGouvListType>(row));
        // }
        console.log(`[export:CarpoolRepository] Read ${rows.length} rows`);
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[dataGouvList] ${e.message}`);
      } else {
        logger.error(`[dataGouvList] Unknown error`);
      }
      throw e;
      // } finally {
      //   cursor && await cursor.release();
    }
  }

  /**
   * Get the statistics for the DataGouv description
   */
  public async datagouvStats(params: ExportParams): Promise<DataGouvStatsType> {
    const query = datagouvStatsQuery(params, this.datagouvConfig);
    const rows = await this.pgConnection.query<DataGouvStatsType>(query);
    return rows[0];
  }
}
