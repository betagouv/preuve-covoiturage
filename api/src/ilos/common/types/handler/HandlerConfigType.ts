import { RouteParams } from "@/ilos/common/index.ts";

export type HandlerConfigType = {
  service?: string;
  method?: string;
  version?: string;
  local?: boolean;
  signature?: string;
  containerSignature?: string;
  apiRoute?: RouteParams;
};
