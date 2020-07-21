export type HandlerConfigType = {
  service?: string;
  method?: string;
  version?: string;
  local?: boolean;
  queue?: boolean;
  signature?: string;
  containerSignature?: string;
};
