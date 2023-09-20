import { GeoCode, Id, SerializedError } from '../common';

interface UpsertableSuccessCarpoolGeo {
  carpool_id: Id;
  start_geo_code: GeoCode;
  end_geo_code: GeoCode;
}

interface UpsertableErrorCarpoolGeo {
  carpool_id: Id;
  error: SerializedError;
}

export type UpsertableCarpoolGeo = UpsertableSuccessCarpoolGeo | UpsertableErrorCarpoolGeo;
