export interface GeoCode {
  type: string;
  value: string;
}

export interface GeoImporterData {
  name: string;
  codes: GeoCode[];
}

export interface GeoImporterDataWithGeo extends GeoImporterData {
  geo: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface GeoImporterDataWithMeta extends GeoImporterData {
  surface: number;
  population: number;
}
