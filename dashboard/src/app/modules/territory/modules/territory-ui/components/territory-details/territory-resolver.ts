import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { TerritoryBaseInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryApiService } from '../../../../services/territory-api.service';

@Injectable({ providedIn: 'root' })
export class TerritoryResolver implements Resolve<TerritoryBaseInterface> {
  constructor(private territoryApiService: TerritoryApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<TerritoryBaseInterface> | Promise<TerritoryBaseInterface> | TerritoryBaseInterface {
    return this.territoryApiService.getById(parseInt(route.paramMap.get('id')));
  }
}
