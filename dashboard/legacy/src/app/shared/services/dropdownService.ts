import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operatorService';
import { AomService } from '~/modules/aom/services/aomService';
import { ApiResponse } from '~/entities/responses/apiResponse';

import { GROUPS } from '../../config/groups';
import { ROLES } from '../../config/roles';

/*
 * Methods used to get dropdown options
 */
@Injectable()
export class DropdownService {
  constructor(private operatorService: OperatorService, private aomService: AomService) {}

  getAoms(): Observable<any> {
    return this.aomService.get().pipe(map((response: ApiResponse) => this.formatDropdownOptions(response.data, 'aom')));
  }

  getOperators(): Observable<object> {
    return this.operatorService
      .get()
      .pipe(map((response: ApiResponse) => this.formatDropdownOptions(response.data, 'operator')));
  }

  getGroups() {
    return this.formatDropdownOptions(GROUPS);
  }

  getRoles() {
    return this.formatDropdownOptions(ROLES);
  }

  formatDropdownOptions(list, type = '') {
    const options = [];

    switch (type) {
      case 'operator':
        for (const el of list) {
          options.push({
            key: el._id,
            value: el.nom_commercial,
          });
        }
        break;

      case 'aom':
        for (const el of list) {
          options.push({
            key: el._id,
            value: el.name,
          });
        }
        break;

      default:
        for (const el of list) {
          options.push({
            key: el,
            value: el,
          });
        }
    }

    return options;
  }
}
