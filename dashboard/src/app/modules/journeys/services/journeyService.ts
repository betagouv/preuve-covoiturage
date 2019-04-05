import { Injectable } from '@angular/core';

import { ApiService } from '~/services/apiService';

@Injectable()
export class JourneyService extends ApiService{
  public endPoint = '/journeys';

  public messages = {
    created: 'Le trajet a bien été crée.',
    deleted: 'Le trajet a bien été supprimé.',
    updated: 'Le trajet a bien été mis à jour',
  };

  send(journey): any {
    return this.post(journey);
  }

  getCsv() {
    return this.http
        .get(`${this.endPoint}/download`, { responseType: 'blob' });
  }
}
