import axios from 'axios';

import { CallType } from '~/types/CallType';
import { HandlerInterface } from '~/interfaces/HandlerInterface';
import { handler } from '~/Container';
import { NewableType } from '~/types/NewableType';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';

import { ResultType } from '../types/ResultType';
import { ServiceException } from '../exceptions/ServiceException';

/**
 * Http handler
 * @export
 * @class HttpHandler
 * @implements {HandlerInterface}
 */
export class HttpHandler implements HandlerInterface {
  readonly middlewares: MiddlewareInterface[] = [];

  protected readonly service: string;
  protected readonly version: string;
  protected booted = false;
  protected readonly url: string;

  private client;

  boot() {
    this.client = axios.create({
      baseURL: this.url,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    this.booted = true;
  }

  public async call(call: CallType): Promise<ResultType> {
    if (!this.booted) {
      this.boot();
    }

    const { method, params, context } = call;
    try {
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

/**
 * httpHandlerFactory - Create a HttpHandler for a remote service
 * @export
 * @param {string} service - service name
 * @param {string} url - service url
 * @param {string} [version]
 * @returns {NewableType<HandlerInterface>}
 */
export function httpHandlerFactory(service: string, url: string, version?: string): NewableType<HandlerInterface> {
  @handler({
    service,
    version,
    method: '*',
    transport: 'http',
  })
  class CustomHttpHandler extends HttpHandler {
    protected readonly service: string = service;
    protected readonly version: string = version;
    protected readonly url: string = url;
  }
  return CustomHttpHandler;
}
