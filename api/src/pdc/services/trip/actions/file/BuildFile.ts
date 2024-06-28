import {
  FileHandle,
  fsConstants,
  open,
  Stringifier,
  stringify,
} from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import { getTmpDir } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { join } from "@/lib/path/index.ts";
import { v4 } from "@/lib/uuid/index.ts";
import { PgCursorHandler } from "@/shared/common/PromisifiedPgCursor.ts";
import {
  FormatInterface,
  ParamsInterface,
} from "@/shared/trip/buildExport.contract.ts";
import { getOpenDataExportName } from "../../helpers/getOpenDataExportName.ts";
import {
  normalizeExport,
  normalizeOpendata,
} from "../../helpers/normalizeExportDataHelper.ts";
import { ExportTripInterface } from "../../interfaces/index.ts";
import { BuildExportAction } from "../BuildExportAction.ts";

@provider()
export class BuildFile {
  constructor() {}

  public async buildCsvFromCursor(
    cursor: PgCursorHandler<ExportTripInterface>,
    params: ParamsInterface,
    date: Date,
    isOpendata: boolean,
  ): Promise<string> {
    // CSV file
    const { filename, tz } = this.cast(params.type, params, date);
    const filepath = join(getTmpDir(), filename);
    const fd = await open(filepath, fsConstants.O_APPEND);

    // Transform data
    const stringifier = this.configure(fd, params.type);
    const normalizeMethod = isOpendata ? normalizeOpendata : normalizeExport;

    try {
      let count = 0;
      do {
        const results = await cursor.read(10);
        count = results.length;
        for (const line of results) {
          stringifier.write(normalizeMethod(line, tz));
        }
      } while (count !== 0);

      // Release the db, end the stream and close the file
      await cursor.release();
      stringifier.end();
      await fd.close();

      logger.debug(`Finished exporting file: ${filepath}`);

      return filepath;
    } catch (e) {
      await cursor.release();
      await fd.close();
      logger.error(e.message, e.stack);
      throw e;
    }
  }

  private cast(
    type: string,
    params: ParamsInterface,
    date: Date,
  ): Required<FormatInterface> {
    return {
      tz: params.format?.tz ?? "Europe/Paris",
      filename: params.format?.filename ?? type === "opendata"
        ? getOpenDataExportName("csv", date)
        : `covoiturage-${v4()}.csv`,
    };
  }

  private configure(
    fd: FileHandle,
    type = "opendata",
  ): Stringifier {
    const stringifier = stringify({
      delimiter: ";",
      header: true,
      columns: BuildExportAction.getColumns(type),
      cast: {
        boolean: (b: Boolean): string => (b ? "OUI" : "NON"),
        date: (d: Date): string => d.toISOString(),
        number: (n: Number): string => n.toString().replace(".", ","),
      },
      quoted: true,
      quoted_empty: true,
      quoted_string: true,
    });

    stringifier.on("readable", async () => {
      let row: string;
      while ((row = stringifier.read()) !== null) {
        await fd.appendFile(row, { encoding: "utf8" });
      }
    });

    stringifier.on("end", () => {
      logger.debug(`Finished exporting CSV`);
    });

    stringifier.on("error", (err) => {
      logger.error(err.message);
    });

    return stringifier;
  }
}
