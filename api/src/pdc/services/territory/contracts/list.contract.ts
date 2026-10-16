import { ResultWithPagination } from "@/shared/common/interfaces/ResultWithPagination.ts";

interface SingleResultInterface {
  _id: number;
  name: string;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface>;
