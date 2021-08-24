import { get } from 'lodash';
import { FlattenTripInterface } from '../actions/BuildExportAction';
import { ExportTripInterface } from '../interfaces';
import { format, utcToZonedTime } from 'date-fns-tz';

export function normalize(src: ExportTripInterface, timeZone: string): FlattenTripInterface {
  const jsd = utcToZonedTime(src.journey_start_datetime, timeZone);
  const jed = utcToZonedTime(src.journey_end_datetime, timeZone);

  const data = {
    ...src,

    // format and convert to user timezone
    journey_start_datetime: format(jsd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
    journey_start_date: format(jsd, 'yyyy-MM-dd', { timeZone }),
    journey_start_time: format(jsd, 'HH:mm:ss', { timeZone }),

    journey_end_datetime: format(jed, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
    journey_end_date: format(jed, 'yyyy-MM-dd', { timeZone }),
    journey_end_time: format(jed, 'HH:mm:ss', { timeZone }),

    // distance in meters
    journey_distance: src.journey_distance,
    journey_distance_calculated: src.journey_distance_calculated,
    journey_distance_anounced: src.journey_distance_anounced,

    // duration in minutes
    journey_duration: Math.round(src.journey_duration / 60),
    journey_duration_calculated: Math.round(src.journey_duration_calculated / 60),
    journey_duration_anounced: Math.round(src.journey_duration_anounced / 60),

    // financial in euros
    driver_revenue: get(src, 'driver_revenue', 0) / 100,
    passenger_contribution: get(src, 'passenger_contribution', 0) / 100,
  };

  const driver_incentive_raw = (get(src, 'driver_incentive_raw', []) || []).filter((i) => i.type === 'incentive');
  const passenger_incentive_raw = (get(src, 'passenger_incentive_raw', []) || []).filter((i) => i.type === 'incentive');

  for (let i = 0; i < 4; i++) {
    // normalize incentive in euro
    const id = i + 1;
    data[`passenger_incentive_${id}_siret`] = get(passenger_incentive_raw, `${i}.siret`);
    data[`passenger_incentive_${id}_amount`] = get(passenger_incentive_raw, `${i}.amount`, 0) / 100;
    data[`passenger_incentive_rpc_${id}_siret`] = get(data, `passenger_incentive_rpc_raw.${i}.siret`);
    data[`passenger_incentive_rpc_${id}_name`] = get(data, `passenger_incentive_rpc_raw.${i}.policy_name`);
    data[`passenger_incentive_rpc_${id}_amount`] = get(data, `passenger_incentive_rpc_raw.${i}.amount`, 0) / 100;
    data[`driver_incentive_${id}_siret`] = get(driver_incentive_raw, `${i}.siret`);
    data[`driver_incentive_${id}_amount`] = get(driver_incentive_raw, `${i}.amount`, 0) / 100;
    data[`driver_incentive_rpc_${id}_siret`] = get(data, `driver_incentive_rpc_raw.${i}.siret`);
    data[`driver_incentive_rpc_${id}_name`] = get(data, `driver_incentive_rpc_raw.${i}.policy_name`);
    data[`driver_incentive_rpc_${id}_amount`] = get(data, `driver_incentive_rpc_raw.${i}.amount`, 0) / 100;
  }

  return data;
}
