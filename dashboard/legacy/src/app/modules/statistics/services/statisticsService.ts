import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';

@Injectable()
export class StatisticsService extends ApiService {
  public endPoint = '/stats';
}
