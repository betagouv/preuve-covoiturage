import { AbstractDataset } from "../../../common/AbstractDataset.ts";
import { SqlError } from "../../../errors/SqlError.ts";
import { TransformError } from "../../../errors/TransformError.ts";
import { streamData } from "../../../helpers/index.ts";
import {
  ArchiveFileTypeEnum,
  FileTypeEnum,
} from "../../../interfaces/index.ts";

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
    ["com", ["INSEE_COM", "varchar"]],
    ["pop", ["POPULATION", "integer"]],
  ]);

  sheetOptions = {
    filter: "features",
  };

  fileType: FileTypeEnum = FileTypeEnum.Shp;

  transformedFiles: Array<
    { file: string; key: string } & { [k: string]: any }
  > = [];

  async transform(): Promise<void> {
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

  async load(): Promise<void> {
    const connection = await this.connection.connect();
    await connection.query("BEGIN TRANSACTION");
    let i = 1;
    try {
      for (const { file, key } of this.transformedFiles) {
        if (file && file.length) {
          console.debug(`Processing file ${file} : ${key}`);
          const cursor = streamData(file, this.fileType, this.sheetOptions);
          let done = false;
          const comField = this.rows.get("com") || [];
          do {
            const results = await cursor.next();
            done = !!results.done;
            if (results.value) {
              const values = [
                JSON.stringify(results.value.map((r) => r.value)),
              ];
              console.debug(`Batch ${i}`);
              switch (key) {
                case "geom":
                  await connection.query({
                    text: `
                      INSERT INTO ${this.tableWithSchema} (
                        ${[...this.rows.keys(), key].join(", \n")}
                      )
                      WITH tmp as(
                        SELECT * FROM
                        json_to_recordset($1)
                        as t(type varchar, properties json,geometry json)
                      )
                      SELECT ${
                      [...this.rows]
                        .map(([k, r]) =>
                          `(properties->>'${r[0]}')::${r[1]} AS ${k}`
                        )
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
                  await connection.query({
                    text: `
                      UPDATE ${this.tableWithSchema}
                      SET ${key} = st_multi(ST_SetSRID(st_geomfromgeojson(tt.geometry),4326))
                      FROM (
                        SELECT * FROM
                        json_to_recordset($1)
                        as t(type varchar, properties json,geometry json)
                      ) AS tt
                      WHERE com = (tt.properties->>'${comField[0]}')::${
                      comField[1]
                    }
                    `,
                    values,
                  });
                  break;
                case "centroid":
                  await connection.query({
                    text: `
                      UPDATE ${this.tableWithSchema}
                      SET ${key} = ST_SetSRID(st_geomfromgeojson(tt.geometry),4326)
                      FROM (
                        SELECT * FROM
                        json_to_recordset($1)
                        as t(type varchar, properties json,geometry json)
                      ) AS tt
                      WHERE com = (tt.properties->>'${comField[0]}')::${
                      comField[1]
                    }
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
      console.error(e);
      throw new SqlError(this, (e as Error).message);
    }
  }
}
