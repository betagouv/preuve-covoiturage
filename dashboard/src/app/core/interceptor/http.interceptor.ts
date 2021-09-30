import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { get } from 'lodash-es';
import { Router } from '@angular/router';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';

import { ConfigService } from '../services/config.service';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = this.config.get('apiUrl');
  private router: Router;

  private readonly canSkip503 = ['trip:stats', 'trip:searchcount', 'campaign:simulateOnPast'];

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
      catchError((err) => {
        switch (err.status) {
          case 401:
            // ignore toastr error
            break;
          case 429:
            /**
             * Display a waiting time in seconds to the user
             * Add info() to the console
             */
            const { limit, current, remaining, resetTime } = err.error.error;
            const wait = new Date(resetTime).getTime() - new Date().getTime();

            this.toastr.error(`merci de réessayer dans ${(wait / 1000) | 0}s`, "Trop d'essais de connexion");

            console.warn('Too many requests', { limit, current, remaining, resetTime });
            break;

          case 0: // Unknown error
          case 503: // Maintenance mode
            if (this.can503(req)) this.router.navigate(['/503']);
            break;

          default:
            // log default errors to avoid doubling on toaster messages
            const message = get(err, 'error.error.data', err.message);
            console.error(message);
        }

        return throwError(err);
      }),
    );
  }

  private can503(req: HttpRequest<any>): boolean {
    return this.canSkip503.reduce((p, c) => p && !req.url.includes(c), true);
  }
}
