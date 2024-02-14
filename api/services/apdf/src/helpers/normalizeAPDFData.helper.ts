import { format, utcToZonedTime } from 'date-fns-tz';
import { APDFTripInterface } from '../interfaces/APDFTripInterface';

export function normalize(src: APDFTripInterface, booster_dates: Set<string>, timeZone: string): APDFTripInterface {
  const sd = utcToZonedTime(src.start_datetime, timeZone);
  const ed = utcToZonedTime(src.end_datetime, timeZone);

  // format and convert to user timezone
  const sdf = format(sd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
  const edf = format(ed, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });

  const s = sdf.substring(0, 10);
  const e = edf.substring(0, 10);
  let type: 'normale' | 'booster' = 'normale';
  if (booster_dates.has(s) || booster_dates.has(e)) {
    type = 'booster';
  }

  const data: APDFTripInterface = {
    ...src,

    start_datetime: sdf,
    end_datetime: edf,

    // check if the trip is in regular or booster mode
    incentive_type: type,

    // incentives in euros
    rpc_incentive: src.rpc_incentive / 100,
  };

  return data;
}
