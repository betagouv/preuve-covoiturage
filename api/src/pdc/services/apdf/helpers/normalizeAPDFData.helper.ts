import { format, toZonedTime } from "@/deps.ts";
import { APDFTripInterface } from "../interfaces/APDFTripInterface.ts";

export function normalize(
  src: APDFTripInterface,
  booster_dates: Set<string>,
  timeZone: string,
): APDFTripInterface {
  const sd = toZonedTime(src.start_datetime, timeZone);
  const ed = toZonedTime(src.end_datetime, timeZone);

  // format and convert to user timezone
  const sdf = format(sd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
  const edf = format(ed, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });

  const s = sdf.substring(0, 10);
  const e = edf.substring(0, 10);
  let type: "normale" | "booster" = "normale";
  if (booster_dates.has(s) || booster_dates.has(e)) {
    type = "booster";
  }

  const data: APDFTripInterface = {
    ...src,

    operator_journey_id: src.operator_journey_id &&
      String(src.operator_journey_id).toUpperCase(),
    operator_trip_id: src.operator_trip_id &&
      String(src.operator_trip_id).toUpperCase(),
    driver_operator_user_id: src.driver_operator_user_id &&
      String(src.driver_operator_user_id).toUpperCase(),
    passenger_operator_user_id: src.passenger_operator_user_id &&
      String(src.passenger_operator_user_id).toUpperCase(),
    rpc_journey_id: src.rpc_journey_id &&
      String(src.rpc_journey_id).toUpperCase(),

    start_datetime: sdf,
    end_datetime: edf,

    // check if the trip is in regular or booster mode
    incentive_type: type,

    // incentives in euros
    rpc_incentive: src.rpc_incentive / 100,
  };

  return data;
}
