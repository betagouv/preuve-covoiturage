// based on pino levels
export enum RPCErrorLevel {
  SILENT = Infinity,
  ERROR = 50,
  WARN = 40,
  INFO = 30,
  DEBUG = 20,
}

export type RPCErrorData = string | { message: string; level: RPCErrorLevel; [k: string]: any } | undefined;

// TODO legacy stuff to simplify
export type RPCErrorType = {
  code: number;
  message: string;
  data?: RPCErrorData;
};
