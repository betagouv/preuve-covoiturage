import { CsvOptions } from "@/deps.ts";
import { FileTypeEnum } from "../../interfaces/FileInterface.ts";
import { JsonOptions, StreamDataOptions, XlsxOptions } from "../../interfaces/StreamDataOptions.ts";
import { streamCsv } from "./streamCsv.ts";
import { streamJson } from "./streamJson.ts";
import { streamXlsx } from "./streamXlsx.ts";

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
