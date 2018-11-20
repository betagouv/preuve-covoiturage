import { Injectable } from '@angular/core';
import { Router, CanActivate , ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../token/service';
import { Observable } from 'rxjs';
import { PingService } from '../ping/service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private tokenService: TokenService, private pingService: PingService ) { }

    canActivate ( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
      return this.pingService.ping(state.url);
    }

}

