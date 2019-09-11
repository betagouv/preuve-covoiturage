import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { JsonRPCPayload } from '~/core/entities/api/jsonRPCPayload';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { environment } from '../../../../environments/environment';

interface RPCOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  // observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  // responseType: 'arraybuffer';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class JsonRPCService {
  private url: string;

  constructor(private http: HttpClient) {
    this.url = 'rpc';
  }

  public callOne(method: JsonRPCParam, options: RPCOptions = { withCredentials: true }): Observable<JsonRPCPayload> {
    return this.call([method], options).pipe(map((datas) => datas[0]));
  }

  public call(methods: JsonRPCParam[], options: RPCOptions = { withCredentials: true }): Observable<JsonRPCPayload[]> {
    options.withCredentials = true;

    let urlWithMethods = this.url;
    methods.forEach((method, index) => {
      if (index === 0) {
        urlWithMethods += '?methods=';
      } else {
        urlWithMethods += ',';
      }
      urlWithMethods += `${method.method}`;
    });
    return this.http.post(urlWithMethods, methods, options).pipe(
      map((response: JsonRPCResponse) => {
        const res: JsonRPCPayload[] = [];
        if (response.payload && response.payload.data) {
          response.payload.data.forEach((data) => {
            if (data.error) {
              const errorMessage = `JSON RCP Error
              ${data.id} : ${data.error.code} ::
              ${data.error.message}
              ${data.error.data}`;
              console.error(errorMessage);
              throw new Error(errorMessage);
            }

            res.push({ id: data.id, data: data.result ? data.result : null });
          });
        }
        return res;
      }),
    );
  }
}
