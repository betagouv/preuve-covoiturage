import {
  UpsertableErrorCarpoolGeo,
  UpsertableSuccessCarpoolGeo,
} from "../../interfaces/index.ts";

export const upsertableGeoSuccess: UpsertableSuccessCarpoolGeo = {
  carpool_id: 1,
  start_geo_code: "91400",
  end_geo_code: "91400",
};

export const upsertableGeoError: UpsertableErrorCarpoolGeo = {
  carpool_id: 1,
  error: JSON.parse(JSON.stringify(new Error("Boum"))),
};
