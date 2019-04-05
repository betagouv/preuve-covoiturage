import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LoggerService } from '../applicativeService/logger/service';

@Injectable()
export class CleanService {
  constructor(private loggerService: LoggerService) {
    this.loggerService = loggerService;
  }


  public cleanObject(obj: any): any {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
        delete obj[propName];
      }
    }
    return obj;
  }
}
