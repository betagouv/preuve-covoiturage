import { ResultType } from "./ResultType.ts";
import { ContextType } from "./ContextType.ts";
import { ParamsType } from "./ParamsType.ts";

export type CallType<P = ParamsType, C = ContextType, R = ResultType> = {
  method: string;
  context: C;
  params: P;
  result?: R;
};
