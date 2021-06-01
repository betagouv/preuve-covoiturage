// tslint:disable:no-bitwise
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { PublicTripSearchInterface } from '../../../core/entities/api/shared/trip/common/interfaces/TripSearchInterface';

@Injectable({
  providedIn: 'root',
})
export class StatPublicService {
  constructor(private _http: HttpClient) {}

  public load(params: PublicTripSearchInterface): Observable<StatInterface[]> {
    return this._http.post('stats', params).pipe(tap((data: StatInterface[]) => {}));
  }
}
