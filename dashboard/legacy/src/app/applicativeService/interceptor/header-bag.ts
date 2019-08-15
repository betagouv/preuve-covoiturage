import { Injectable } from '@angular/core';

import { TokenService } from '../token/token.service';

@Injectable()
export class HeaderBag {
  static get(params: any | undefined): any {
    return [{ name: 'Authorization', value: 'Bearer ' + TokenService.get() }];
  }
}
