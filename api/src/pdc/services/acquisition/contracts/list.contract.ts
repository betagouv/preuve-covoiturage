import { CarpoolStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";

export interface ParamsInterface {
  operator_id: number;
  status: CarpoolStatusEnum;
  limit?: number;
  offset?: number;
  start?: Date;
  end?: Date;
}

export type ResultInterface = Array<{
  operator_journey_id: string;
}>;

export const handlerConfig = {
  service: "acquisition",
  method: "list",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
