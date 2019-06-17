import { Exceptions } from '@ilos/core';
import axios from 'axios';

import { mockNewUserBase } from './newUserBase';
import { UserBaseInterface } from '../../src/interfaces/UserInterfaces';


interface AomOperator {
  aom?: string;
  operator?: string;
}

export class MockFactory {
  port = '8081';

  public call(
    method: string,
    params: any,
    callUserProperties: UserBaseInterface,
  ) {
    const callUser = {
      group : 'registry',
      role: 'admin',
      permissions: [],
      _id: 'fakeId',
      ...callUserProperties,
    };

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
            user: callUser,
          },
        },
      },
    };
  }

  public newUser(group: string = 'registry', role: string = 'admin', aomOperator: AomOperator = {}, email?) {
    return {
      ...mockNewUserBase,
      group,
      role,
      email: email || `${mockNewUserBase.firstname}.${mockNewUserBase.lastname}@${group}.com`,
      ...aomOperator,
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
