import { ExportType } from '../models/Export';
import { FieldFilter, Fields } from '../models/XLSXWriter';

export const prefix = 'RPC';

export const filters: Array<FieldFilter> = [
  {
    type: ExportType.OPENDATA,
    exclusions: [
      'operator',
      'operator_journey_id',
      'operator_passenger_id',
      'operator_driver_id',
      'passenger_contribution',
      'driver_revenue',
    ],
  },
  {
    type: ExportType.OPERATOR,
    exclusions: ['operator', 'has_incentive'],
  },
  {
    type: ExportType.REGISTRY,
    exclusions: ['has_incentive'],
  },
  {
    type: ExportType.TERRITORY,
    exclusions: ['has_incentive'],
  },
];

// fields are defined in the models/CarpoolRow.ts types
export const fields: Fields = [
  'trip_id',
  'operator_journey_id',
  'operator_class',

  'status',

  'start_datetime_utc',
  'start_date_utc',
  'start_time_utc',
  'end_datetime_utc',
  'end_date_utc',
  'end_time_utc',

  'duration',
  'distance',

  'start_lat',
  'start_lon',
  'end_lat',
  'end_lon',

  'start_insee',
  'start_commune',
  'start_departement',
  'start_epci',
  'start_aom',
  'start_region',
  'start_pays',

  'end_insee',
  'end_commune',
  'end_departement',
  'end_epci',
  'end_aom',
  'end_region',
  'end_pays',

  'operator',
  'operator_passenger_id',
  'operator_driver_id',

  'driver_revenue',
  'passenger_contribution',

  'offer_public',
  'offer_accepted_at',

  'campaign_mode',
  'has_incentive',

  'incentive_0_index',
  'incentive_0_siret',
  'incentive_0_amount',
  'incentive_1_index',
  'incentive_1_siret',
  'incentive_1_amount',
  'incentive_2_index',
  'incentive_2_siret',
  'incentive_2_amount',

  'incentive_rpc_0_siret',
  'incentive_rpc_0_amount',
  'incentive_rpc_1_siret',
  'incentive_rpc_1_amount',
  'incentive_rpc_2_siret',
  'incentive_rpc_2_amount',
];
