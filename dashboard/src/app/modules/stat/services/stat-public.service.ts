import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { PublicTripSearchInterface } from '../../../core/entities/api/shared/trip/common/interfaces/PublicTripStatInterface';
import { TripStatInterface } from '../../../core/entities/api/shared/trip/common/interfaces/TripStatInterface';

@Injectable({
  providedIn: 'root',
})
export class StatPublicService {
  private DEFAULT_PUBLIC_PARAMS: TripStatInterface = {};

  constructor(private http: HttpClient) {
    const start: Date = new Date(new Date().setMonth(new Date().getMonth() - 12));
    start.setHours(2, 0, 0, 0);

    const end: Date = new Date(new Date().setDate(new Date().getDate() - 5));
    end.setHours(2, 0, 0, 0);

    this.DEFAULT_PUBLIC_PARAMS.date = { start, end };
    this.DEFAULT_PUBLIC_PARAMS.tz = 'Europe/Paris';
  }

  public load(params: PublicTripSearchInterface): Observable<StatInterface[]> {
    Object.assign(params, this.DEFAULT_PUBLIC_PARAMS);
    return this.http.post<StatInterface[]>('stats', params);
  }
}
