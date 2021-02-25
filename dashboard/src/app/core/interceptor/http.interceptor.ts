import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { ConfigService } from '../services/config.service';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = this.config.get('apiUrl');
  private router: Router;

  constructor(private config: ConfigService, private injector: Injector, public toastr: ToastrService) {
    this.router = this.injector.get(Router);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('assets/icons')) {
      return next.handle(req);
    }

    const update: any = {};

    if (this.APIMETHODS.indexOf(req.method) !== -1 && !req.url.startsWith('https://')) {
      update.url = this.api + req.url;
    }

    const clonedRequest: HttpRequest<any> = req.clone(update);

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        switch (error.status) {
          case 401:
            // ignore toastr error
            break;
          case 429:
            /**
             * Display a waiting time in seconds to the user
             * Add info() to the console
             */
            const { limit, current, remaining, resetTime } = error.error.error;
            const wait = new Date(resetTime).getTime() - new Date().getTime();

            this.toastr.error(`merci de réessayer dans ${(wait / 1000) | 0}s`, "Trop d'essais de connexion");

            console.warn('Too many requests', { limit, current, remaining, resetTime });
            break;

          case 0: // Unknown error
          case 503: // Maintenance mode
            this.router.navigate(['/503']);
            break;

          default:
            this.toastr.error(error.message);
        }

        return throwError(error);
      }),
    );
  }
}
