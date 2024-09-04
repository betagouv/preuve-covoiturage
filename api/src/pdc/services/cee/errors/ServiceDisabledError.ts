import { RPCException } from "@/ilos/common/index.ts";

export class ServiceDisabledError extends RPCException {
  constructor() {
    super("This service is disabled");
    this.rpcError = {
      data: {},
      code: -32601,
      message: this.message,
    };
  }
}
