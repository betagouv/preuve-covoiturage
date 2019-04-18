import axios from 'axios';

import { ProviderInterface } from '~/interfaces/ProviderInterface';
import { ResultType } from '~/types/ResultType';
import { ParamsType } from '~/types/ParamsType';
import { ContextInterface } from '~/interfaces/communication/ContextInterface';

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

  async public call(method: string, params: ParamsType, context: ContextInterface): Promise<ResultType> {
    const response = await this.client.post({
      method,
      params,
      context,
      jsonrpc: '2.0',
    });
    if (!response.result) {
      throw new Error(response.error.message);
    }
    return response.result;
  }
}
