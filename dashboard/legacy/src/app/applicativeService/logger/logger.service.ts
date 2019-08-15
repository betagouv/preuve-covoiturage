import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable()
export class LoggerService {
  log() {
    if (!environment.production) {
      // @ts-ignore
      console.log(...arguments);
    }
  }
}
