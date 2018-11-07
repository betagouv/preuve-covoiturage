import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpHandler} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import { HeaderBag } from './header-bag';




export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: any;
}



@Injectable()
export class ApplicationHttpClient {

  private api = environment.origin;

  // Extending the HttpClient through the Angular DI.
  public constructor(public http: HttpClient, public headerBag: HeaderBag) {
    // If you don't want to use the extended versions in some cases you can access the public property and use the original one.
    // for ex. this.httpClient.http.get(...)
  }

  public Get<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
    return this.http.get<T>(this.api + endPoint, this.getRequestOptionArgs(options));
  }

  public Post<T>(endPoint: string, params: Object, options?: IRequestOptions): Observable<T> {
    return this.http.post<T>(this.api + endPoint, params, options);
  }

  // /**
  //  * PATCH request
  //  * @param {string} endPoint end point of the api
  //  * @param {Object} params body of the request.
  //  * @param {IRequestOptions} options options of the request like headers, body, etc.
  //  * @returns {Observable<T>}
  //  */
  // public Patch<T>(endPoint: string, params: Object, options?: IRequestOptions): Observable<T> {
  //   return this.http.patch<T>(this.api + endPoint, params, this.getRequestOptionArgs(options));
  // }


  public Put<T>(endPoint: string, params: Object, options?: IRequestOptions): Observable<T> {
    return this.http.put<T>(this.api + endPoint, params, this.getRequestOptionArgs(options));
  }

  public Delete<T>(endPoint: string, options?: IRequestOptions): Observable<T> {
    return this.http.delete<T>(this.api + endPoint, this.getRequestOptionArgs(options));
  }

  private getRequestOptionArgs(options?: IRequestOptions, apiRequest: boolean = true): IRequestOptions {

    // if (apiRequest) {
    //
    //   let httpHeaders = {};
    //   let headers = this.headerBag.get([]);
    //
    //   for (let i in headers) {
    //     httpHeaders[headers[i].name] = headers[i].value;
    //   }
    //
    //   options.headers = new HttpHeaders(httpHeaders);
    // }

    return options;
  }
}