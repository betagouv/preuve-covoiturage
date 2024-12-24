import { CsvOptions } from "@/deps.ts";
import { streamCsv } from "@/etl/helpers/data/streamCsv.ts";
import { streamJson } from "@/etl/helpers/data/streamJson.ts";
import { streamXlsx } from "@/etl/helpers/data/streamXlsx.ts";
import { FileTypeEnum } from "@/etl/interfaces/FileInterface.ts";
import { JsonOptions, StreamDataOptions, XlsxOptions } from "@/etl/interfaces/StreamDataOptions.ts";

export function streamData<T>(
  filepath: string,
  filetype: FileTypeEnum,
  sheetOptions: StreamDataOptions,
  chunkSize = 100,
): any {
  switch (filetype) {
    case FileTypeEnum.Ods:
    case FileTypeEnum.Xls:
      return streamXlsx<T>(filepath, sheetOptions as XlsxOptions, chunkSize);
    case FileTypeEnum.Csv:
      return streamCsv<T>(filepath, sheetOptions as CsvOptions, chunkSize);
    case FileTypeEnum.Geojson:
      return streamJson(filepath, sheetOptions as JsonOptions, chunkSize);
    default:
      throw new Error();
  }
}
