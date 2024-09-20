import { AdmZip, stringify } from "@/deps.ts";
import { getTmpDir, open, OpenFileDescriptor } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { join } from "@/lib/path/index.ts";
import { sanitize } from "@/pdc/helpers/string.helper.ts";
import {
  AllowedComputedFields,
  CarpoolRow,
  CarpoolRowData,
} from "./CarpoolRow.ts";
import { ExportTarget } from "./Export.ts";

export type Datasources = Map<string, unknown>;

export type Fields = Array<keyof CarpoolRowData | keyof AllowedComputedFields>;

export type FieldFilter = { target: ExportTarget; exclusions: Partial<Fields> };

export type ComputedProcessors = Array<ComputedProcessor>;

// TODO find a way to type the compute() return type depending on the name
export type ComputedProcessor = {
  name: keyof AllowedComputedFields;
  compute: (
    row: CarpoolRow,
    datasources: Datasources,
  ) => AllowedComputedFields[keyof AllowedComputedFields] | null;
};

export type Options = {
  compress: boolean;
  fields: Partial<Fields>;
  computed: ComputedProcessors;
  datasources: Datasources;
};

export class CSVWriter {
  protected fileStream: OpenFileDescriptor | null = null;
  protected fileExt = "csv";
  protected archiveExt = "zip";
  protected folder: string;
  protected basename: string;
  protected options: Options = {
    compress: true,
    fields: [],
    computed: [
      {
        name: "incentive_type",
        compute(row, datasources) {
          // for each campaign, get the mode at the start date or the end date
          // and return the higher one (booster)
          return row.value("campaigns", []).reduce((acc, id) => {
            const campaign = datasources.get("campaigns").get(id);
            if (!campaign) return acc;
            const mode = campaign.getModeAt([
              row.value("start_datetime"),
              row.value("end_datetime"),
            ]);
            return acc === "booster" ? acc : mode;
          }, "normal");
        },
      },
      {
        name: "has_incentive",
        compute(row) {
          return row.hasIncentive();
        },
      },
    ],
    datasources: new Map(),
  };
  protected stringifierOptions = {
    header: true,
    delimiter: ";", // Excel uses semicolon as default delimiter
    quoted_string: true,
  };
  protected stringifier = stringify(this.stringifierOptions);

  constructor(filename: string, config: Partial<Options>) {
    this.options = { ...this.options, ...config } as Options;
    this.folder = getTmpDir();
    this.basename = sanitize(filename, 128);
  }

  public async create(): Promise<CSVWriter> {
    this.fileStream = await open(this.path, { write: true });
    this.stringifier.on("readable", () => {
      let row;
      // deno-lint-ignore no-cond-assign
      while (row = this.stringifier.read()) {
        this.fileStream?.write(row);
      }
    });
    this.stringifier.on("error", (err) => {
      console.error(err.message);
    });
    this.stringifier.on("finish", () => {
      this.fileStream?.close();
    });

    return this;
  }

  public async close(): Promise<CSVWriter> {
    this.stringifier.end();
    return this;
  }

  // append lines to the data sheet
  public async append(carpoolRow: CarpoolRow): Promise<CSVWriter> {
    // add computed fields to the carpool row
    this.options.computed.forEach((field: ComputedProcessor) => {
      carpoolRow.addField(
        field.name,
        field.compute(carpoolRow, this.options.datasources),
      );
    });

    this.stringifier.write(carpoolRow.get());

    return this;
  }

  public async printHelp(): Promise<CSVWriter> {
    // No help in CSV
    return this;
  }

  // TODO compress the file with ZIP (for now)
  public async compress(): Promise<CSVWriter> {
    if (!this.options.compress) {
      logger.info(`Skipped compression of ${this.csvPath}`);
      return this;
    }

    const zip = new AdmZip();
    zip.addLocalFile(this.csvPath);
    zip.writeZip(this.archivePath);

    return this;
  }

  public async cleanup(): Promise<CSVWriter> {
    // TODO

    return this;
  }

  public get filename(): string {
    return this.options.compress ? this.archiveFilename : this.csvFilename;
  }

  public get path(): string {
    return this.options.compress ? this.archivePath : this.csvPath;
  }

  public get csvFilename(): string {
    return `${this.basename}.${this.fileExt}`;
  }

  public get csvPath(): string {
    return join(this.folder, this.filename);
  }

  public get archiveFilename(): string {
    return `${this.basename}.${this.archiveExt}`;
  }

  public get archivePath(): string {
    return join(this.folder, this.archiveFilename);
  }

  public addDatasource(key: string, value: any): CSVWriter {
    this.options.datasources.set(key, value);
    return this;
  }
}
