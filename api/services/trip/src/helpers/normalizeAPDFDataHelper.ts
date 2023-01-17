import { format, utcToZonedTime } from 'date-fns-tz';
import { APDFTripInterface } from '~/interfaces/APDFTripInterface';

export function normalize(src: APDFTripInterface, timeZone: string): APDFTripInterface {
  const sd = utcToZonedTime(src.start_datetime, timeZone);
  const ed = utcToZonedTime(src.end_datetime, timeZone);

  const data: APDFTripInterface = {
    ...src,

    // format and convert to user timezone
    start_datetime: format(sd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
    end_datetime: format(ed, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),

    // distance in meters
    distance: src.distance,

    // duration in minutes
    duration: Math.round(src.duration / 60),

    // incentives in euros
    driver_rpc_incentive: src.driver_rpc_incentive / 100,
    passenger_rpc_incentive: src.passenger_rpc_incentive / 100,
  };

  return data;
}
