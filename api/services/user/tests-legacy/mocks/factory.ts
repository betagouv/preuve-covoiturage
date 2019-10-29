import axios from 'axios';

import { RPCException } from '@ilos/common';
import { UserInterface } from '@pdc/provider-schema';

import { mockCreateUserParams, mockNewUserBase } from './newUserBase';

interface TerritoryOperator {
  territory?: string;
  operator?: string;
}

export class MockFactory {
  static generatePassword() {
    return Math.random()
      .toString(36)
      .substring(2, 15);
  }

  public call(method: string, params: any, callUserProperties: any) {
    const callUser = {
      group: 'registry',
      role: 'admin',
      permissions: [],
      _id: '5d0b5f7208e64927d0c63841',
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

  public createUserParams(
    group: string = 'registry',
    role: string = 'admin',
    territoryOperator: TerritoryOperator = {},
    email?,
  ) {
    return {
      ...mockCreateUserParams,
      group,
      role,
      email: email || `${mockNewUserBase.firstname}.${mockNewUserBase.lastname}@${group}.example.com`,
      ...territoryOperator,
    };
  }

  public newUser(
    group: string = 'registry',
    role: string = 'admin',
    territoryOperator: TerritoryOperator = {},
    email?,
  ) {
    return {
      ...mockNewUserBase,
      group,
      role,
      email: email || `${mockNewUserBase.firstname}.${mockNewUserBase.lastname}@${group}.example.com`,
      ...territoryOperator,
    };
  }

  public get newTerritoryUserModel() {
    return this.newUser('territories', 'user', { territory: '5cef990d133992029c1abe44' }, null);
  }
  public get newOperatorUserModel() {
    return this.newUser('operators', 'user', { operator: '5cef990d133992029c1abe41' }, null);
  }
  public get newRegistryUserModel() {
    return this.newUser('registry', 'user', {}, null);
  }

  public get newRegistryAdminModel() {
    return this.newUser('registry', 'admin', {}, null);
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
}
