import { GeoCode, Id, SerializableError } from '../common';

export interface UpsertableSuccessCarpoolGeo {
  carpool_id: Id;
  start_geo_code: GeoCode;
  end_geo_code: GeoCode;
}

export interface UpsertableErrorCarpoolGeo {
  carpool_id: Id;
  error: SerializableError;
}

export type UpsertableCarpoolGeo = UpsertableSuccessCarpoolGeo | UpsertableErrorCarpoolGeo;
