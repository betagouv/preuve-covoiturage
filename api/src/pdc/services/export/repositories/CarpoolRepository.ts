import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection, NativeCursor } from "@/ilos/connection-postgres/LegacyPostgresConnection.ts";
import { logger } from "@/lib/logger/index.ts";
import { CarpoolAcquisitionStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { Timezone } from "@/pdc/providers/validator/index.ts";
import { CarpoolRow } from "@/pdc/services/export/models/CarpoolRow.ts";
import { CSVWriter } from "@/pdc/services/export/models/CSVWriter.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { ExportProgress } from "@/pdc/services/export/repositories/ExportRepository.ts";
import { QueryTemplates } from "@/pdc/services/export/repositories/queries/AbstractQuery.ts";
import {
  CarpoolListQuery,
  CarpoolListType,
  TemplateKeys,
} from "@/pdc/services/export/repositories/queries/CarpoolListQuery.ts";
import {
  DataGouvStatsQuery,
  DataGouvStatsType,
} from "@/pdc/services/export/repositories/queries/DataGouvStatsQuery.ts";
import { IncentiveStatusEnum } from "@/pdc/services/policy/interfaces/index.ts";
import { DataGouvListQuery, DataGouvListType } from "./queries/DataGouvListQuery.ts";

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

  constructor(public connection: LegacyPostgresConnection, protected config: ConfigInterfaceResolver) {}

  /**
   * List carpools for the general exports
   */
  public async list(
    params: ExportParams,
    fileWriter: CSVWriter<CarpoolListType>,
    progress?: ExportProgress,
  ): Promise<void> {
    const [values, templates] = this.getListValuesAndTemplates(params);

    // use a cursor to loop over the entire set of results
    // by chunks of N rows.
    let cursor: NativeCursor<CarpoolListType> | undefined = undefined;

    try {
      const total = await this.listCount(params); // total number of rows
      logger.info(`[export:CarpoolRepository] Exporting ${total} rows`);

      let done = 0; // track the number of rows read
      let count = 0; // number of rows read in the current batch

      const text = new CarpoolListQuery().getText(templates);
      cursor = await this.connection.getNativeCursor<CarpoolListType>(text, values);

      do {
        // const { rows } = await client.queryObject<CarpoolListType>(`FETCH FORWARD ${this.batchSize} FROM mycursor`);
        const rows = await cursor.read(this.batchSize);
        count = rows.length;
        done += count;

        // pass each line to the file writer
        for (const row of rows) {
          await fileWriter.append(new CarpoolRow<CarpoolListType>(row));
        }

        if (progress) await progress(((done / total) * 100) | 0);
      } while (count !== 0);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[export:CarpoolRepository] ${e.message}`, { values });
      } else {
        logger.error(`[export:CarpoolRepository] Unknown error`, { values });
      }
      throw e;
    } finally {
      cursor && await cursor.release();
    }
  }

  /**
   * Count the number of carpools for the general exports
   */
  public async listCount(params: ExportParams): Promise<number> {
    const [[start_at, end_at, year], templates] = this.getListValuesAndTemplates(params);
    const { rows } = await this.connection.getClient().query({
      text: new CarpoolListQuery().getCountText(templates),
      values: [start_at, end_at, year],
    });

    return Number.parseInt(rows[0].count, 10);
  }

  /**
   * Prepare the values and templates for the general exports list queries
   */
  private getListValuesAndTemplates(
    params: ExportParams,
  ): [[Date, Date, number, Timezone], QueryTemplates<TemplateKeys>] {
    const { start_at, end_at, tz } = params.get();
    const values: [Date, Date, number, Timezone] = [start_at, end_at, 2023, tz];
    const templates: QueryTemplates<TemplateKeys> = new Map();
    templates.set("geo_selectors", params.geoToSQL());
    templates.set("operator_id", params.operatorToSQL());

    return [values, templates];
  }

  /**
   * List carpools with specific filtering for the open data requirements
   */
  public async dataGouvList(params: ExportParams, fileWriter: CSVWriter<DataGouvListType>): Promise<void> {
    let cursor: NativeCursor<DataGouvListType> | undefined = undefined;
    const query = DataGouvListQuery(params, this.datagouvConfig);

    try {
      let count = 0;
      cursor = await this.connection.getNativeCursor(query.text, query.values);

      do {
        const rows = await cursor.read(this.batchSize);
        count = rows.length;
        for (const row of rows) {
          await fileWriter.append(new CarpoolRow<DataGouvListType>(row));
        }
      } while (count !== 0);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[dataGouvList] ${e.message}`);
      } else {
        logger.error(`[dataGouvList] Unknown error`);
      }
      throw e;
    } finally {
      cursor && await cursor.release();
    }
  }

  /**
   * Get the statistics for the DataGouv description
   */
  public async dataGouvStats(params: ExportParams): Promise<DataGouvStatsType> {
    const query = DataGouvStatsQuery(params, this.datagouvConfig);
    const { rows } = await this.connection.getClient().query(query);

    return rows[0];
  }
}
