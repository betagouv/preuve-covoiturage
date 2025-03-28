import { logger } from "@/lib/logger/index.ts";
import { AbstractDataset } from "../../../common/AbstractDataset.ts";
import { SqlError } from "../../../errors/SqlError.ts";
import { TransformError } from "../../../errors/TransformError.ts";
import { streamData } from "../../../helpers/index.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../interfaces/index.ts";

export interface TransformationParamsInterface {
  key: string;
  format: string;
  precision: number;
  force: boolean;
  simplify: string[];
}

const defaultConfig: TransformationParamsInterface = {
  key: "",
  format: "geojson",
  precision: 0.000001,
  force: false,
  simplify: [],
};
export abstract class IgnDataset extends AbstractDataset {
  abstract readonly transformations: Array<
    [string, Partial<TransformationParamsInterface>]
  >;

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.SevenZip;
  readonly rows: Map<string, [string, string]> = new Map([
    ["arr", ["INSEE_ARM", "varchar"]],
    ["com", ["INSEE_COM", "varchar"]],
    ["pop", ["POPULATION", "integer"]],
  ]);

  override sheetOptions = {
    filter: "features",
  };

  fileType: FileTypeEnum = FileTypeEnum.Shp;

  transformedFiles: Array<
    { file: string; key: string } & { [k: string]: any }
  > = [];

  override async transform(): Promise<void> {
    try {
      const filepaths: string[] = [];
      for await (const [file, customConfig] of this.transformations) {
        const config = { ...defaultConfig, ...customConfig };
        const path = this.filepaths.find((f) => f.indexOf(file) >= 0);
        if (path) {
          let transformedFilePath: string;
          if (config.simplify && config.simplify.length) {
            transformedFilePath = path;
            for (const simplify of config.simplify) {
              transformedFilePath = await this.file.transform(
                transformedFilePath,
                config.format,
                config.precision,
                config.force,
                simplify,
              );
            }
          } else {
            transformedFilePath = await this.file.transform(
              path,
              config.format,
              config.precision,
              config.force,
            );
          }
          filepaths.push(transformedFilePath);
          this.transformedFiles.push({
            file: transformedFilePath,
            key: config.key,
            file_orig: file,
          });
        }
      }
      this.filepaths = filepaths;
      this.fileType = FileTypeEnum.Geojson;
    } catch (e) {
      throw new TransformError(this, (e as Error).message);
    }
  }

  override async load(): Promise<void> {
    const connection = await this.connection.connect();
    await connection.query("BEGIN TRANSACTION");
    try {
      for (const { file, key } of this.transformedFiles) {
        if (file && file.length) {
          let i = 1;
          logger.info(`Processing file ${file} : ${key}`);

          const chunkSize = 1000;
          const cursor = streamData(file, this.fileType, this.sheetOptions, chunkSize);
          let done = false;
          const comField = this.rows.get("com") || [];
          const arrField = this.rows.get("arr") || [];

          let results;
          do {
            results = await cursor.next();
            console.log(`Processing chunk ${i} of ${chunkSize} - ${key}`);
            done = !!results.done;
            if (results.value) {
              const values = [JSON.stringify(results.value)];

              switch (key) {
                case "geom":
                  logger.info("  > Updating geom");
                  await connection.query({
                    text: `
                      INSERT INTO ${this.tableWithSchema} (
                        ${[...this.rows.keys(), key].join(", \n")}
                      )
                      WITH tmp as(
                        SELECT *
                        FROM json_to_recordset($1::json)
                          AS t(type varchar, properties json,geometry json)
                      )
                      SELECT ${
                      [...this.rows]
                        .map(([k, r]) => `(properties->>'${r[0]}')::${r[1]} AS ${k}`)
                        .join(", \n")
                    },
                      st_multi(ST_SetSRID(st_geomfromgeojson(geometry),4326)) as ${key} 
                      FROM tmp
                      ON CONFLICT DO NOTHING
                    `,
                    values,
                  });
                  break;
                case "geom_simple":
                  logger.info("  > Updating geom_simple");
                  await connection.query({
                    text: `
                      UPDATE ${this.tableWithSchema} AS tgt
                      SET ${key} = st_multi(ST_SetSRID(st_geomfromgeojson(tt.geometry),4326))
                      FROM (
                        SELECT *
                        FROM json_to_recordset($1::json)
                          AS t(type varchar, properties json,geometry json)
                      ) AS tt
                      WHERE (tgt.arr IS NOT NULL AND tgt.arr = (tt.properties->>'${arrField[0]}')::${arrField[1]})
                         OR (tgt.arr IS NULL AND tgt.com = (tt.properties->>'${comField[0]}')::${comField[1]})
                    `,
                    values,
                  });
                  break;
                case "centroid":
                  logger.info("  > Updating centroids");
                  await connection.query({
                    text: `
                      UPDATE ${this.tableWithSchema} AS tgt
                      SET ${key} = ST_SetSRID(st_geomfromgeojson(tt.geometry),4326)
                      FROM (
                        SELECT *
                        FROM json_to_recordset($1::json)
                          AS t(type varchar, properties json,geometry json)
                      ) AS tt
                      WHERE (tgt.arr IS NOT NULL AND tgt.arr = (tt.properties->>'${arrField[0]}')::${arrField[1]})
                         OR (tgt.arr IS NULL AND tgt.com = (tt.properties->>'${comField[0]}')::${comField[1]})
                    `,
                    values,
                  });
                  break;
              }
            }
            i += 1;
          } while (!done);
        }
      }

      logger.info("  > Updating missing centroids");
      await connection.query({
        text: `
          UPDATE ${this.tableWithSchema}
          SET centroid = ST_PointOnSurface(geom)
          WHERE st_astext(centroid) IS NULL
        `,
      });

      await connection.query("COMMIT");
      connection.release();
    } catch (e) {
      await connection.query("ROLLBACK");
      connection.release();
      logger.error(e);
      throw new SqlError(this, (e as Error).message);
    }
  }
}
