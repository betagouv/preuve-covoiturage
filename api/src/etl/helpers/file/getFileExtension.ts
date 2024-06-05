import { FileTypeEnum } from '../../interfaces/index.ts';

export function getFileExtensions(filetype: FileTypeEnum): string[] {
  switch (filetype) {
    case FileTypeEnum.Csv:
      return ['.csv'];
    case FileTypeEnum.Ods:
      return ['.ods'];
    case FileTypeEnum.Xls:
      return ['.xls', '.xlsx'];
    case FileTypeEnum.Geojson:
      return ['.tson', '.geojson'];
    case FileTypeEnum.Shp:
      return ['.shp'];
    default:
      throw new Error(`Unknown file type ${filetype}`);
  }
}
