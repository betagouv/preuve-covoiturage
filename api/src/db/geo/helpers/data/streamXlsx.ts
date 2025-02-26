import xlsx from "dep:xlsx";
import { XlsxOptions } from "../../interfaces/index.ts";

export async function* streamXlsx<T>(
  filepath: string,
  sheetOptions: XlsxOptions,
  chunkSize = 100,
): AsyncIterable<T[]> {
  const file = xlsx.readFile(filepath, { cellDates: true });
  const options = {
    name: 0,
    startRow: 0,
    ...sheetOptions,
  };
  const data = xlsx.utils.sheet_to_json(file.Sheets[options.name], {
    range: options.startRow,
  });
  while (data.length > 0) {
    const chunk = data.splice(0, chunkSize) as T[];
    yield chunk;
  }
  return;
}
