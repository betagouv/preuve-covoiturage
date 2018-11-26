import {of as observableOf, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Logged} from '../authguard/logged';
import {Injectable} from '@angular/core';
import {TokenService} from '../token/service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {LoggerService} from '../logger/service';


@Injectable()
export class PingService {
  constructor(private router: Router, private tokenService: TokenService, private http: HttpClient, private loggerService: LoggerService
  ) { }

  public ping(url: string): Observable<boolean>{

    return this
        .http
        .get( '/auth/ping' ).pipe(
        catchError( ( error: Response ) => {
          let status = 500;
          if ( error.status === 401 || error.status === 403 ) { // unauthorized or forbidden //
            status = error.status;
          }
          return observableOf({ status : status });
        }),
        map( response => {
          if ( 401 === response['status']  || 403 === response['status']) {
            this.router.navigate(['/login']);
            return true;
          } else {
            const logged = true;
            Logged.set(logged);
            return logged;
          }
        }));


  }


}


