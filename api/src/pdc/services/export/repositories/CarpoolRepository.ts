import { provider } from "@/ilos/common/Decorators.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/PostgresConnection.ts";
import { logger } from "@/lib/logger/index.ts";
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
  CarpoolOpenDataListType,
  CarpoolOpenDataQuery,
} from "@/pdc/services/export/repositories/queries/CarpoolOpenDataQuery.ts";

export abstract class CarpoolRepositoryInterfaceResolver {
  public async list(params: ExportParams, fileWriter: CSVWriter<CarpoolListType>): Promise<void> {
    throw new Error("Not implemented");
  }
  public async listCount(params: ExportParams): Promise<number> {
    throw new Error("Not implemented");
  }
  public async openDataList(params: ExportParams, fileWriter: CSVWriter<CarpoolOpenDataListType>): Promise<void> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: CarpoolRepositoryInterfaceResolver,
})
export class CarpoolRepository {
  public readonly table = "carpool_v2.carpools";
  private readonly batchSize = 1000;

  constructor(public connection: PostgresConnection) {}

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
    let cursor: any; // FIXME type PostgresConnection['getCursor'] fails

    try {
      const total = await this.listCount(params); // total number of rows
      logger.info(`[export:CarpoolRepository] Exporting ${total} rows`);

      let done = 0; // track the number of rows read
      let count = 0; // number of rows read in the current batch

      const text = new CarpoolListQuery().getText(templates);
      cursor = await this.connection.getCursor<CarpoolListType>(text, values);
      do {
        const results = await cursor.read(this.batchSize);
        count = results.length;
        done += count;

        // pass each line to the file writer
        for (const row of results) {
          await fileWriter.append(new CarpoolRow<CarpoolListType>(row));
        }

        if (progress) await progress(((done / total) * 100) | 0);
      } while (count !== 0);

      cursor && await cursor.release();
    } catch (e) {
      logger.error(`[export:CarpoolRepository] ${e.message}`, { values });
      cursor && await cursor.release();
      throw e;
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
  public async openDataList(params: ExportParams, fileWriter: CSVWriter<CarpoolOpenDataListType>): Promise<void> {
    let cursor: any; // FIXME type PostgresConnection['getCursor'] fails
    const query = CarpoolOpenDataQuery(params);

    try {
      let count = 0;
      cursor = await this.connection.getCursor(query.text, query.values);

      do {
        const results = await cursor.read(this.batchSize);
        count = results.length;

        for (const row of results) {
          await fileWriter.append(new CarpoolRow<CarpoolOpenDataListType>(row));
        }
      } while (count !== 0);

      cursor && await cursor.release();
    } catch (e) {
      logger.error(`[listOpendData] ${e.message}`);
      cursor && await cursor.release();
      throw e;
    }
  }
}
