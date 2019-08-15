import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { IncentiveParameter } from '~/entities/database/Incentive/incentiveParameter';

@Injectable()
export class IncentiveParameterService extends ApiService {
  private parameters: IncentiveParameter[] = [];
  private createdParameters: IncentiveParameter[] = [];
  public endPoint = '/incentive/parameters';

  public get allParameters() {
    return [...this.parameters, ...this.createdParameters];
  }

  public create(parameter: IncentiveParameter) {
    this.createdParameters.push(parameter);
  }

  public async get() {
    if (this.parameters.length === 0) {
      const result = await this.http.get<ApiResponse>(`${this.endPoint}`).toPromise();

      this.parameters = [...result.data];
    }

    return this.allParameters;
  }
}
