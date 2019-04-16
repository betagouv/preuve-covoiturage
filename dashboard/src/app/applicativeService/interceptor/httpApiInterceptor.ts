import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { environment } from '../../../environments/environment';
import { HeaderBag } from './header-bag';
import { AuthenticationService } from '../authentication/service';
import { FORBIDDEN, NOTFOUND, UNAUTHORIZED } from '../../config/http';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = environment.apiUrl;

  constructor(
    private router: Router,
    private authentificationService: AuthenticationService,
    private messageService: MessageService,
  ) {
  }

  public intercept(req: HttpRequest<any>,
                   next: HttpHandler): Observable<HttpEvent<any>> {
    const update = {};
    if (this.APIMETHODS.indexOf(req.method) !== -1) {
      update['url'] = this.api + req.url;

      const globalHeaders = HeaderBag.get([])
        .reduce(
          (bag, { name, value }) => {
            bag[name] = value;

            return bag;
          },
          {},
        );

      const headers = req.headers
        .keys()
        .reduce(
          (p, c) => {
            p[c] = req.headers.get(c);

            return p;
          },
          globalHeaders,
        );

      update['headers'] = new HttpHeaders(headers);
    }

    const clonedRequest: HttpRequest<any> = req.clone(update);

    return next.handle(clonedRequest).pipe(
      map(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            if (event.body['payload']) {
              return event.clone({ body: event.body['payload'] });
            }

            // todo :  verify hash ?

            return event;
          }
        },
      ),
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          /**
           * 401 Unauthorized
           * The user isn't connected
           */
          case UNAUTHORIZED:
            this.authentificationService.logout({
              toLogin: true,
              redirectTo: this.router.url,
            });
            break;

          /**
           * 403 Forbidden
           * The user doesn't have the right to access the ressource
           */
          case FORBIDDEN:
            this.messageService.add({
              severity: 'error',
              summary: 'Vous n\'êtes pas connecté ou bien vous n\'avez pas les droits',
            });
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
