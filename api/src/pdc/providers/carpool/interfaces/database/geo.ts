import { GeoCode, Id, SerializableError } from "../common.ts";

export type CarpoolGeo = {
  _id: Id;
  carpool_id: Id;
  start_geo_code: GeoCode;
  end_geo_code: GeoCode;
  errors: Array<unknown>;
};

export interface UpsertableSuccessCarpoolGeo {
  carpool_id: Id;
  start_geo_code: GeoCode;
  end_geo_code: GeoCode;
}

export interface UpsertableErrorCarpoolGeo {
  carpool_id: Id;
  error: SerializableError;
}

export type UpsertableCarpoolGeo =
  | UpsertableSuccessCarpoolGeo
  | UpsertableErrorCarpoolGeo;
