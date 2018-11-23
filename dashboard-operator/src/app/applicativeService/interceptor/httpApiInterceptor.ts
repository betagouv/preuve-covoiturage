
import {concatMap, tap} from 'rxjs/operators';
import {
  HTTP_INTERCEPTORS, HttpResponse, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError as _throw} from 'rxjs';
import { Router} from '@angular/router';
import {Logged} from '../authguard/logged';
import {environment} from '../../../environments/environment';
import {HeaderBag} from './header-bag';
import {TokenService} from '../token/service';
import {MessageService} from "../message/service";


@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {

  private APIMETHODS = ['POST', 'GET', 'PATCH', 'DELETE'];
  private api = environment.origin;


  constructor(private router: Router, public headerBag: HeaderBag, private tokenService: TokenService) {
  }

  public intercept(req: HttpRequest<any>,
                   next: HttpHandler): Observable<HttpEvent<any>> {

    const update = {};
    return this.headerBag.load().pipe(concatMap(() => {

      if (this.APIMETHODS.indexOf(req.method) !== -1) {

        update['url'] = this.api + req.url;

        const httpHeaders = {};
        const headers = this.headerBag.get([]);

        for (const i in headers) {
          if (headers.hasOwnProperty(i)) {
            httpHeaders[headers[i].name] = headers[i].value;
          }
        }

        update['headers'] = new HttpHeaders(httpHeaders);

      }

      const clonedRequest: HttpRequest<any> = req.clone(update);
      return next.handle(clonedRequest).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.error['msg']) {
            MessageService.error(err.error['msg']);
          }
          if (err.status === 401 || err.status === 403 ) {
            this.tokenService.clear();
            Logged.set(false);
          }
          if (err.status === 404) {
            MessageService.error("Une erreur est survenue");
          }
        }
      }));

    }));

  }


}

