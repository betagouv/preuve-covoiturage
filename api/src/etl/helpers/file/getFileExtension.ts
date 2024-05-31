import { FileTypeEnum } from '../../interfaces/index.js';

export function getFileExtensions(filetype: FileTypeEnum): string[] {
  switch (filetype) {
    case FileTypeEnum.Csv:
      return ['.csv'];
    case FileTypeEnum.Ods:
      return ['.ods'];
    case FileTypeEnum.Xls:
      return ['.xls', '.xlsx'];
    case FileTypeEnum.Geojson:
      return ['.json', '.geojson'];
    case FileTypeEnum.Shp:
      return ['.shp'];
    default:
      throw new Error(`Unknown file type ${filetype}`);
  }
}
