import { Exceptions } from '@ilos/core';
import axios from 'axios';
import { bootstrap } from '@ilos/framework';

export class MockFactory {
  port = '8081';
  transport;

  public async startTransport(): Promise<any> {
    this.transport = await bootstrap.boot(['', '', 'http', this.port]);
  }

  public async stopTransport(): Promise<void> {
    await this.transport.down();
  }

  public call(method: string, params: any) {
    return {
      method,
      id: 1,
      jsonrpc: '2.0',
      params: {
        params,
        _context: {
          channel: {
            service: 'proxy',
            transport: 'http',
          },
          call: {
            user: {},
          },
        },
      },
    };
  }

  public error(err: Exceptions.RPCException) {
    return {
      status: 200,
      data: {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: err.rpcError.code,
          message: err.rpcError.message,
          data: err.rpcError.data,
        },
      },
    };
  }

  public request() {
    return axios.create({
      baseURL: `http://127.0.0.1:${this.port}`,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }
}
