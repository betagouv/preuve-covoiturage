import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpApiInterceptor implements HttpInterceptor {
  private APIMETHODS = ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
  private api = environment.apiUrl;
  private currentToken: string;

  constructor(private authService: AuthenticationService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('assets/icons')) {
      return next.handle(req);
    }
    this.currentToken = this.authService.token;
    const update: any = {};
    if (this.APIMETHODS.indexOf(req.method) !== -1) {
      update.url = this.api + req.url;
      update.setHeaders = {
        Authorization: 'Bearer ' + this.currentToken,
      };
    }

    const clonedRequest: HttpRequest<any> = req.clone(update);

    return next.handle(clonedRequest);
  }
}
