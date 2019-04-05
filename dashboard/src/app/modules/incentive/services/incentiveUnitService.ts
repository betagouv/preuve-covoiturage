import { Injectable } from '@angular/core';

import { ApiService } from '~/services/apiService';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { IncentiveUnit } from '~/entities/database/Incentive/incentiveUnit';

@Injectable()
export class IncentiveUnitService extends ApiService {
  private units: IncentiveUnit[] = [];
  private createdUnits: IncentiveUnit[] = [];
  public endPoint = '/incentive/units';

  public get allUnits() {
    return [
      ...this.units,
      ...this.createdUnits,
    ];
  }

  public async get() {
    if (this.units.length === 0) {
      const result = await this.http
          .get<ApiResponse>(`${this.endPoint}`)
          .toPromise();

      this.units = [...result.data];
    }
    return this.allUnits;
  }

  public create(unit: IncentiveUnit) {
    this.createdUnits.push(unit);
  }
}
