// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.2/package/types/index.d.ts"
import * as xlsx from 'https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs';

import { XlsxOptions } from '../../interfaces/index.ts';

export async function* streamXlsx<T>(filepath: string, sheetOptions: XlsxOptions, chunkSize = 100): AsyncIterable<T[]> {
  const file = xlsx.readFile(filepath, { cellDates: true });
  const options = {
    name: 0,
    startRow: 0,
    ...sheetOptions,
  };

  const data = xlsx.utils.sheet_to_json<T>(file.Sheets[options.name], { range: options.startRow });
  while (data.length > 0) {
    const chunk = data.splice(0, chunkSize);
    yield chunk;
  }
  return;
}
