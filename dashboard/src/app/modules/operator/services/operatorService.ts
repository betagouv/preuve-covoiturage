import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '~/shared/services/apiService';
import { ApiResponse } from '~/entities/responses/apiResponse';

@Injectable()
export class OperatorService extends ApiService {
  public endPoint = '/operators';

  public messages = {
    created: "L'opérateur a bien été crée.",
    deleted: "L'opérateur a bien été supprimé.",
    updated: "L'opérateur a bien été mis à jour",
  };

  getUsers(opId: string) {
    return this.http.get(`${this.endPoint}/${opId}/users`);
  }

  addAuthorisations(opId: string, orgId: string | string[]): Observable<Object> {
    const joinedIds = Array.isArray(orgId) ? orgId.join(',') : orgId;

    return this.http.post(`${this.endPoint}/${opId}/authorisations/add`, {
      orgId: joinedIds,
      orgType: 'aom',
    });
  }

  // TODO @front
  dropdown() {
    return this.http.get(`${this.endPoint}/dropdown?limit=400`);
  }
}
