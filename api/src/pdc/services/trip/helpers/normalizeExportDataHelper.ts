import { get } from 'lodash';
import { FlattenTripInterface } from '../actions/BuildExportAction';
import { ExportTripInterface } from '../interfaces';
import { format, toZonedTime } from 'date-fns-tz';

export function normalizeExport(src: ExportTripInterface, timeZone: string): FlattenTripInterface {
  const { data, driver_incentive_raw, passenger_incentive_raw } = normalize(src, timeZone);

  // financial in euros
  data.driver_revenue = get(src, 'driver_revenue', 0) / 100;
  data.passenger_contribution = get(src, 'passenger_contribution', 0) / 100;

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

export function normalizeOpendata(src: ExportTripInterface, timeZone: string): FlattenTripInterface {
  const { data, driver_incentive_raw, passenger_incentive_raw } = normalize(src, timeZone);

  data.has_incentive =
    driver_incentive_raw.length > 0 ||
    passenger_incentive_raw.length > 0 ||
    data.driver_incentive_rpc_raw?.length > 0 ||
    data.passenger_incentive_rpc_raw?.length > 0;

  return data;
}

function normalize(
  src: ExportTripInterface,
  timeZone: string,
): { data: FlattenTripInterface; driver_incentive_raw; passenger_incentive_raw } {
  const jsd = toZonedTime(src.journey_start_datetime, timeZone);
  const jed = toZonedTime(src.journey_end_datetime, timeZone);

  const data: FlattenTripInterface = {
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
  };

  const driver_incentive_raw = (get(src, 'driver_incentive_raw', []) || []).filter((i) => i.type === 'incentive');
  const passenger_incentive_raw = (get(src, 'passenger_incentive_raw', []) || []).filter((i) => i.type === 'incentive');

  return {
    data,
    driver_incentive_raw,
    passenger_incentive_raw,
  };
}
