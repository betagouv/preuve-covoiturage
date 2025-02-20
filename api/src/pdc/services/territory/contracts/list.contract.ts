import { PaginationParamsInterface } from "@/shared/common/interfaces/PaginationParamsInterface.ts";
import { ResultWithPagination } from "@/shared/common/interfaces/ResultWithPagination.ts";

export interface ParamsInterface extends PaginationParamsInterface {
  search: string;
}

interface SingleResultInterface {
  _id: number;
  name: string;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface>;

export const handlerConfig = {
  service: "territory",
  method: "list",
} as const;
export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
