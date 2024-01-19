import { FieldFilter, Fields } from '../models/XLSXWriter';
import { ExportType } from '../repositories/ExportRepository';

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
      'incentive',
      'incentive_rpc',
      'incentive_counterpart',
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
  'start_pays',
  'end_insee',
  'end_commune',
  'end_departement',
  'end_epci',
  'end_aom',
  'end_pays',
  'operator',
  'operator_passenger_id',
  'operator_driver_id',
  'driver_revenue',
  'passenger_contribution',
  'campaign_id',
  'incentive',
  'incentive_rpc',
  'incentive_counterpart',
  'offer_public',
  'offer_accepted_at',
  'campaign_mode',
  'has_incentive',
];
