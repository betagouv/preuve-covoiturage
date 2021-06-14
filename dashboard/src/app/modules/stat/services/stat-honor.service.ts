import { ChartData, ChartDataSets } from 'chart.js';
import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StatHonorService {
  private _stats$ = new BehaviorSubject<ChartData>(null);

  get stats() {
    return this._stats$.value;
  }

  get stats$() {
    return this._stats$;
  }

  constructor(private jsonRpc: JsonRPCService) {}

  public fetch(dataSetConfig: Omit<Partial<ChartDataSets>, 'data'>[] = []): void {
    this.jsonRpc
      .callOne(new JsonRPCParam('honor:stats', {}))
      .pipe(
        map(({ data }) => {
          // merge config into datasets based on their index in the array
          dataSetConfig.forEach((cfg, index) => {
            if (data.datasets[index] && dataSetConfig[index]) {
              data.datasets[index] = { ...data.datasets[index], ...dataSetConfig[index] };
            }
          });

          return data;
        }),
      )
      .subscribe((data) => {
        this._stats$.next(data);
      });
  }
}
