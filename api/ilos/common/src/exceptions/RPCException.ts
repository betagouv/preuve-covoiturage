import { RPCErrorData, RPCErrorLevel, RPCErrorType } from '../types';

export abstract class RPCException extends Error {
  public code: number;
  public level: RPCErrorLevel;
  public rpcError: RPCErrorType;

  constructor(code: number, data: RPCErrorData = undefined) {
    super();
    this.code = code;
    this.message = this.constructor.name;
    this.level = RPCErrorLevel.ERROR;

    switch (typeof data) {
      case 'string':
        if (data.length) this.message = data;

        // TODO legacy stuff to simplify
        this.rpcError = { code, message: data, data };
        break;
      case 'object':
        if ('message' in data) this.message = data.message;
        if ('level' in data) this.level = data.level;

        // TODO legacy stuff to simplify
        this.rpcError = { message: this.message, code, data };
        break;
      default:
        // TODO legacy stuff to simplify
        this.rpcError = { message: this.message, code, data: { code, message: this.message, level: this.level } };
    }
  }
}
