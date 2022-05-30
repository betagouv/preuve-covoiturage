import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { TerritoryGroupInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryApiService } from '../../../../services/territory-api.service';

@Injectable({ providedIn: 'root' })
export class TerritoryResolver implements Resolve<TerritoryGroupInterface> {
  constructor(private territoryApiService: TerritoryApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<TerritoryGroupInterface> | Promise<TerritoryGroupInterface> | TerritoryGroupInterface {
    return this.territoryApiService.getById(parseInt(route.paramMap.get('id')));
  }
}
