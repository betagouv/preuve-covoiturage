import axios, { AxiosInstance } from 'axios';

import { CallType, ResultType, HandlerInterface, InitHookInterface, ServiceException } from '@ilos/common';

/**
 * Http handler
 * @export
 * @class HttpHandler
 * @implements {HandlerInterface}
 */
export class HttpHandler implements HandlerInterface, InitHookInterface {
  public readonly middlewares: (string | [string, any])[] = [];

  protected readonly service: string;
  protected readonly version: string;
  protected readonly url: string;

  private client: AxiosInstance;

  public init() {
    throw new Error('no url found');
  }

  protected createClient(url) {
    this.client = axios.create({
      baseURL: url,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public async call(call: CallType): Promise<ResultType> {
    const { method, params, context } = call;
    try {
      // TODO : add channel ?
      const response = await this.client.post('/', {
        method,
        params: {
          params,
          _context: context,
        },
        id: 1,
        jsonrpc: '2.0',
      });

      if (!('data' in response) || !('result' in response.data)) {
        throw new ServiceException(response.data.error);
      }
      call.result = response.data.result;
      return response.data.result;
    } catch (e) {
      if (e.serviceError) {
        throw new Error(e.message);
      }
      throw new Error('An error occured');
    }
  }
}
