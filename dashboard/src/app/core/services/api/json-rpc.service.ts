import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { map } from 'rxjs/operators';

interface JsonRPCResponse {
  payload: { meta: string; data: any[] };
}

@Injectable({
  providedIn: 'root',
})
export class JsonRPCService {
  private url: string;

  constructor(private http: HttpClient) {
    this.url = 'rpc';
  }

  public call(methods: JsonRPCParam[] | JsonRPCParam, options = {}): Observable<any> {
    if (methods instanceof JsonRPCParam) {
      // tslint:disable-next-line:no-parameter-reassignment
      methods = [methods];
    }
    return this.http.post(this.url, methods, options).pipe(
      map((response: JsonRPCResponse) => {
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
          });
        }
        return response;
      }),
    );
  }
}
