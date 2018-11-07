// import { XHRBackend,
// 			Http,
// 			RequestOptions }				from "@angular/http";
// import { Router }             				from '@angular/router';
// import {LoggerService} from "./../logger/service";


import { ApplicationHttpClient } 					from './applicationHttpClient';
// import { TokenService }						from './../token/service'
import { HeaderBag }						from './header-bag';
import {HttpClient, HttpHandler} from "@angular/common/http";

export function applicationHttpClientCreator(http: HttpClient, headerBag : HeaderBag) {
  return new ApplicationHttpClient(http, headerBag);
}



// export function httpClientFactory(
//     xhrBackend: XHRBackend,
//     requestOptions: RequestOptions,
//     tokenService: TokenService,
//     router: Router,
//     headerBag: HeaderBag,
//     loggerService: LoggerService
// ): Http {
//   return new ApplicationHttpClient(xhrBackend, requestOptions, tokenService, router, headerBag, loggerService);
// }
