import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { JsonRPCError } from '~/core/entities/api/jsonRPCError';

import { JsonRPCOptions } from '~/core/entities/api/jsonRPCOptions';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

export abstract class JsonRPC {
  constructor(
    protected http: HttpClient,
    protected router: Router,
    protected activedRoute: ActivatedRoute,
    protected url = 'rpc',
  ) {}

  public callOne(method: JsonRPCParam, options?: JsonRPCOptions, throwErrors = true): Observable<JsonRPCResult> {
    return this.call([method], options, throwErrors).pipe(map((datas) => datas[0]));
  }

  public call(methods: JsonRPCParam[], options?: JsonRPCOptions, throwErrors = true): Observable<JsonRPCResult[]> {
    // handle default withCredentials = true for empty object and undefined property
    const finalOptions = options ? options : { withCredentials: true };
    finalOptions.withCredentials = finalOptions.withCredentials !== undefined ? finalOptions.withCredentials : true;

    let urlWithMethods = this.url;
    methods.forEach((method, index) => {
      // increment param id in order to avoid collisions
      method.id += index;
      if (index === 0) {
        urlWithMethods += '?methods=';
      } else {
        urlWithMethods += ',';
      }
      urlWithMethods += `${method.method}`;
    });
    return this.http.post(urlWithMethods, methods, finalOptions).pipe(
      // catchHttpStatus(401, (err) => {
      //   this.router.navigate(['/login']);
      //   throw err;
      // }),
      map((response: JsonRPCResponse[]) => {
        const res: { id: number; data: any; meta: any }[] = [];
        // if (response.data) {
        response.forEach((data: JsonRPCResponse) => {
          if (data.error) {
            const error = new JsonRPCError(data.error);

            if (throwErrors) {
              throw error;
            }
            console.error('RPC error ', error);
          }

          // temporary compatibility solver (for result | result.data)
          const resultData = data.result ? (data.result.data !== undefined ? data.result.data : data.result) : null;

          const resultMeta = data.result && data.result.meta ? data.result.meta : null;

          res.push({ id: data.id, data: resultData, meta: resultMeta });
        });
        // }
        return res;
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class JsonRPCService extends JsonRPC {
  constructor(http: HttpClient, router: Router, activedRoute: ActivatedRoute) {
    super(http, router, activedRoute);
  }
}
