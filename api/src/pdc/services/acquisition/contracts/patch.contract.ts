import { OperatorClass } from "@/pdc/providers/carpool/interfaces/common.ts";
import { Incentive, TimeGeoPoint } from "./common/interfaces/CreateJourneyDTO.ts";

export interface ParamsInterface {
  operator_journey_id: string;
  operator_trip_id?: string;
  operator_class: OperatorClass;
  incentives: Array<Incentive>;
  start: TimeGeoPoint;
  end: TimeGeoPoint;
  distance: number;
}
export type ResultInterface = void;

export const handlerConfig = {
  service: "acquisition",
  method: "patch",
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
