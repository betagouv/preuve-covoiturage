import { Polygon, MultiPolygon } from '@types/geojson';

export interface GeoCode {
    type: string;
    value: string;
}

export interface GeoImporterData {
    name: string;
    code: GeoCode,
}

export interface GeoImporterDataWithGeo extends GeoImporterData {
    geo: Polygon | MultiPolygon;
}

export interface GeoImporterDataWithMeta extends GeoImporterData {
    surface: number;
    population: number;
}

