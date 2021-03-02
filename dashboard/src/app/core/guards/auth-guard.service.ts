import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
import { Groups } from '../enums/user/groups';
import { User } from '../entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  private readonly defaultHomepage = '/trip/stats';
  private readonly territoryHomepage = '/campaign';

  // map enums to their method counterpart
  private readonly groupsMap = {
    [Groups.Registry]: 'isRegistry',
    [Groups.Territory]: 'isTerritory',
    [Groups.Operator]: 'isOperator',
  };

  constructor(private router: Router, private auth: Auth) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivateFn(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivateFn(route, state);
  }

  // Connected users can load all modules
  canLoad(): Observable<boolean | UrlTree> {
    return this.auth.check().pipe(map((user) => !!user || this.router.parseUrl('/login')));
  }

  private canActivateFn(baseRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    let route = baseRoute;
    while (route.firstChild) route = route.firstChild;

    return this.auth.check().pipe(
      map((user: User): boolean => {
        // check user
        if (!user) return false;

        // baseUrl is always redirected
        if (state.url === '/') return false;

        // 1. check role
        const { roles } = route?.data;
        if (roles && !this.auth.hasRole(roles)) return false;

        // 2. check groups
        const { groups } = route?.data;
        if (groups) {
          const hasNone = !((groups as string[]) || []).reduce(
            (p: boolean, c: Groups) => p || this.auth[this.groupsMap[c]](),
            false,
          );
          if (hasNone) return false;
        }

        return true;
      }),
      map((pass) => {
        if (pass) return true;

        // redirect to home page
        return this.router.parseUrl(this.auth.isTerritory() ? this.territoryHomepage : this.defaultHomepage);
      }),
    );
  }
}
