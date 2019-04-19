import axios from 'axios';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { ResultType } from '../types/ResultType';
import { ParamsType } from '../types/ParamsType';
import { ContextType } from '../types/ContextType';
import { resolveMethodFromObject } from '../helpers/resolveMethod';
import { ServiceException } from '../Exceptions/ServiceException';

export class HttpProvider implements ProviderInterface {
  readonly signature: string;
  readonly version: string;
  private readonly url: string;
  private client;

  constructor(signature, url) {
    this.signature = signature;
    this.url = url;
  }

  public boot() {
    this.client = axios.create({
      baseURL: this.url,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public async call(method: string, params: ParamsType, context: ContextType): Promise<ResultType> {
    try {
      const response = await this.client.post('/', {
        params,
        context,
        id: null,
        method: resolveMethodFromObject({
          method,
          service: this.signature,
          version: this.version,
        }),
        jsonrpc: '2.0',
      });

      if (!('data' in response) || !('result' in response.data)) {
        throw new ServiceException(response.data.error);
      }

      return response.data.result;
    } catch (e) {
      if (e.serviceError) {
        throw new Error(e.message);
      }
      throw new Error('An error occured');
    }
  }
}
