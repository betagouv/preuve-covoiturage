import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { streamData } from "../../../../helpers/index.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class EurostatCountries2020 extends AbstractDataset {
  static producer = "eurostat";
  static dataset = "countries";
  static year = 2020;
  static table = "eurostat_countries_2020";
  static url = "https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/CNTR_RG_01M_2020_4326.geojson";
  static sha256 = "12957bf7d7159b51f1785e9f7d2e9efe6caf2b107f31cee82212b8ed36fe7adc";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["codeiso3", ["properties->>ISO3_CODE", "varchar"]],
    ["geom", ["geometry", "geometry(MULTIPOLYGON,4326)"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Geojson;
  override sheetOptions = {
    filter: "features",
  };

  override async load(): Promise<void> {
    const connection = await this.connection.connect();
    await connection.query("BEGIN TRANSACTION");
    try {
      for (const filepath of this.filepaths) {
        const cursor = streamData(filepath, this.fileType, this.sheetOptions);
        let done = false;
        do {
          const results = await cursor.next();
          done = !!results.done;
          if (results.value) {
            const query = {
              text: `
                INSERT INTO ${this.tableWithSchema} (
                    ${[...this.rows.keys()].join(", \n")}
                )
                WITH tmp as(
                  SELECT * FROM
                  json_to_recordset($1::json)
                  as tmp(type varchar, properties json,geometry json)
                )
                SELECT
                  (properties->>'ISO3_CODE')::varchar as codeiso3,
                  ST_SetSRID(st_multi(st_geomfromgeojson(geometry)),4326) as geom
                FROM tmp
                ON CONFLICT DO NOTHING
              `,
              values: [JSON.stringify(results.value)],
            };
            await connection.query(query);
          }
        } while (!done);
      }
      await connection.query("COMMIT");
      connection.release();
    } catch (e) {
      await connection.query("ROLLBACK");
      connection.release();
      throw e;
    }
  }

  override async import(): Promise<void> {}
}
