import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { ApiService } from '~/shared/services/apiService';

@Injectable()
export class JourneyService extends ApiService {
  public endPoint = '/journeys';
  public aomEndPoint = '/aom';

  public messages = {
    created: 'Le trajet a bien été crée.',
    deleted: 'Le trajet a bien été supprimé.',
    updated: 'Le trajet a bien été mis à jour',
  };

  send(journey): any {
    return this.post(journey);
  }

  export(type, filters) {
    return this.get(filters, {
      headers: new HttpHeaders({
        Accept: type === 'csv' ? 'text/csv' : 'application/json',
      }),
      responseType: 'blob',
    });
  }

  listAom() {
    return this.http.get(`${this.aomEndPoint}?limit=1000`);
  }

  dropdownAom() {
    return this.http.get(`${this.aomEndPoint}/dropdown?limit=1000`);
  }
}
