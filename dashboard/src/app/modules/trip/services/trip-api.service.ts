import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { endOfDay, startOfDay } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { BaseParamsInterface as TripExportParamsInterface } from '~/shared/trip/export.contract';
// eslint-disable-next-line
import { TripSearchInterfaceWithPagination } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { LightTrip } from '~/core/entities/trip/trip';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

@Injectable({
  providedIn: 'root',
})
export class TripApiService extends JsonRpcGetList<LightTrip, LightTrip, any, TripSearchInterfaceWithPagination> {
  constructor(http: HttpClient) {
    super(http, 'trip');
  }

  count(params?: TripSearchInterfaceWithPagination): Observable<string> {
    const jsonParams = this.paramGetList(params);
    jsonParams.method = `${this.method}:searchcount`;

    return this.callOne(jsonParams).pipe(map((data) => data.data.count));
  }

  exportTrips(filter: TripExportParamsInterface): Observable<any> {
    const params: TripExportParamsInterface = {
      ...filter,
      date: {
        start: startOfDay(filter.date.start),
        end: endOfDay(filter.date.end),
      },
    };
    const jsonRPCParam = new JsonRPCParam(`${this.method}:export`, params);
    return this.callOne(jsonRPCParam);
  }
}
