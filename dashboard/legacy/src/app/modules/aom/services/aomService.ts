import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';

@Injectable()
export class AomService extends ApiService {
  public endPoint = '/aom';

  public messages = {
    created: "L'AOM a bien été crée.",
    deleted: "L'AOM a bien été supprimée.",
    updated: "L'AOM a bien été mise à jour",
  };

  getUsers(aomId: string) {
    return this.http.get(`${this.endPoint}/${aomId}/users`);
  }

  getStats(aomId: string) {
    return this.http.get(`${this.endPoint}/${aomId}/stats`);
  }
}
