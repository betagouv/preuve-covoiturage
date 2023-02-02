import { RPCErrorData, RPCErrorLevel, RPCErrorType } from '../types';

export abstract class RPCException extends Error {
  public code: number;
  public level: RPCErrorLevel;
  public rpcError: RPCErrorType;

  constructor(code: number, data: RPCErrorData = undefined) {
    super();
    this.code = code;
    this.name = this.constructor.name;
    this.message = this.constructor.name;
    this.level = RPCErrorLevel.ERROR;

    switch (typeof data) {
      case 'string':
        if (data.length) this.message = data;
        break;
      case 'object':
        if ('message' in data) this.message = data.message;
        if ('level' in data) this.level = data.level;
        break;
    }

    // TODO legacy stuff to simplify
    this.rpcError = this.getLegacy(data);
  }

  private getLegacy(data: RPCErrorData | undefined): RPCErrorType {
    const d = 'object' === typeof data ? data : {};

    return {
      message: this.message,
      code: this.code,
      data: { ...d, code: this.code, message: this.message, level: this.level },
    };
  }
}
