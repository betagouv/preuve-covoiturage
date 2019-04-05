import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';


@Injectable()
export class LoggerService {
  log(one: any, two: any = null, three: any = null) {
    if (!environment.production) {
      if (null !== three) {
        console.log(one, two, three);
      } else if (null !== two) {
        console.log(one, two);
      } else {
        console.log(one);
      }
    }
  }
}
