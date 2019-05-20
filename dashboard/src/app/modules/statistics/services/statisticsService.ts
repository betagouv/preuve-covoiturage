import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';
import { Statistic } from '~/entities/database/statistics';

@Injectable()
export class StatisticsService extends ApiService {
  public endPoint = '/stats/test';

  getDataFromPathString(str, apiData): [Statistic] {
    const path = str.split('.');
    let ret: any = [];
    Object.assign(ret, apiData);
    for (const val of path) {
      if (ret[val]) {
        ret = ret[val];
      }
    }
    return ret;
  }

  formatUnit(value, transformation = null, precision = null) {
    let retValue = value;
    if (transformation) {
      retValue = this.transformUnit(retValue, transformation);
    }
    return precision !== null
      ? retValue.toFixed(precision)
      : Math.floor(retValue);
  }

  transformUnit(value, transformation) {
    // operation format: '/123, *123'
    const type = transformation.split('')[0];
    const num = Number(transformation.substring(1));
    switch (type) {
      case '/':
        return value / num;
      case '*':
        return value * num;
    }
  }
}
