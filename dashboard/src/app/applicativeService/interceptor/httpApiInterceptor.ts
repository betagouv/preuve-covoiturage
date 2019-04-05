import { Observable, throwError, throwError as _throw } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import {
  HTTP_INTERCEPTORS, HttpResponse, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { Logged } from '../authguard/logged';
import { environment } from '../../../environments/environment';
import { HeaderBag } from './header-bag';
import { TokenService } from '../token/service';
import { AuthenticationService } from '../authentication/service';
import { UNAUTHORIZED, FORBIDDEN, NOTFOUND } from '../../config/http';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = environment.apiUrl;


  constructor(
    private router: Router,
    private authentificationService: AuthenticationService,
    private messageService: MessageService,
  ) {
    //
  }

  public intercept(req: HttpRequest<any>,
                   next: HttpHandler): Observable<HttpEvent<any>> {
    const update = {};
    if (this.APIMETHODS.indexOf(req.method) !== -1) {
      update['url'] = this.api + req.url;

      const httpHeaders = {};
      const headers = HeaderBag.get([]);

      for (const i in headers) {
        if (headers.hasOwnProperty(i)) {
          httpHeaders[headers[i].name] = headers[i].value;
        }
      }

      update['headers'] = new HttpHeaders(httpHeaders);
    }

    const clonedRequest: HttpRequest<any> = req.clone(update);
    return next.handle(clonedRequest).pipe(
        map(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              if (event.body['payload']) {
                return event.clone({ body: event.body['payload'] });
              }
              return event;

              // todo :  verify hash ?
            }
          },
        ),
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          switch (error.status) {
            case UNAUTHORIZED:
            case FORBIDDEN:
              this.messageService.add({
                severity: 'error',
                summary: 'Vous n\êtes pas connecté ou bien vous n\'avez pas les droits',
              });
              TokenService.clear();
              this.authentificationService.clearUser();
              Logged.set(false);
              console.log('should redirect !');
              this.router.navigate(['/signin']);
              break;
            case NOTFOUND:
              this.messageService.add({
                severity: 'error',
                summary: 'La resource demandée n\'a pas été trouvée',
              });
              break;
            default:
              this.messageService.add({
                severity: 'error',
                summary: error.error.message || 'Une erreur est survenue',
              });
          }
          return throwError(error);
        }),
      );
  }
}
