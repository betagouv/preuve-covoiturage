import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Territory } from '../../../../../../core/entities/territory/territory';
import { TerritoryApiService } from '../../../../services/territory-api.service';

@Injectable({ providedIn: 'root' })
export class TerritoryResolver implements Resolve<Territory> {
  constructor(private service: TerritoryApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.service.getById(parseInt(route.paramMap.get('id')));
  }
}
