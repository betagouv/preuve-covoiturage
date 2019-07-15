// TODO refactor to remove axios
import axios from 'axios';

import { RPCException } from '@ilos/common';

export class MockFactory {
  port = '8088';

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

  public error(err: RPCException) {
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

  public notify(method: string, params: any) {
    return {
      method,
      id: 0,
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
