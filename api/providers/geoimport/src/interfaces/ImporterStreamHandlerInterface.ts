import { GeoImporterDataWithGeo } from './GeoImporterData';

export type ImporterStreamHandlerInterface = (
  data: GeoImporterDataWithGeo,
) => GeoImporterDataWithGeo | Promise<GeoImporterDataWithGeo>;
