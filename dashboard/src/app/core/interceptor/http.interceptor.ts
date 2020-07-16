import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = environment.apiUrl;
  private router;

  constructor(private injector: Injector) {
    this.router = this.injector.get(Router);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('assets/icons')) {
      return next.handle(req);
    }

    // this.currentToken = this.authService.token;
    const update: any = {};

    if (this.APIMETHODS.indexOf(req.method) !== -1 && !req.url.startsWith('https://')) {
      update.url = this.api + req.url;
    }

    const clonedRequest: HttpRequest<any> = req.clone(update);

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 503) {
          this.router.navigate(['/503']);
        }

        return throwError(error);
      }),
    );
  }
}
