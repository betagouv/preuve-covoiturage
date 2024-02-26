import { UpsertableErrorCarpoolGeo, UpsertableSuccessCarpoolGeo } from '../../interfaces';

export const upsertableGeoSuccess: UpsertableSuccessCarpoolGeo = {
  carpool_id: 1,
  start_geo_code: '91400',
  end_geo_code: '91400',
};

export const upsertableGeoError: UpsertableErrorCarpoolGeo = {
  carpool_id: 1,
  error: new Error('Boum'),
};
