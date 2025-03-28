import { PaginationParamsInterface } from "@/shared/common/interfaces/PaginationParamsInterface.ts";
import { ResultWithPagination } from "@/shared/common/interfaces/ResultWithPagination.ts";
import { TerritoryCodeEnum } from "./common/interfaces/TerritoryCodeInterface.ts";

export interface ParamsInterface extends Partial<PaginationParamsInterface> {
  search: string;
  exclude_coms?: boolean;
  where?: {
    insee?: string[];
  };
}

export interface SingleResultInterface {
  _id: number;
  name: string;
  insee: string;
  type: TerritoryCodeEnum;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface[]>;

export const handlerConfig = {
  service: "territory",
  method: "listGeo",
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
