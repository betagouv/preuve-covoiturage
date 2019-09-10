import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JsonRPCParam } from '../../entities/api/jsonRPCParam';

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
    return this.http.post(this.url, methods, options);
  }
}
