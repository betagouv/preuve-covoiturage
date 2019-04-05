import { Injectable } from '@angular/core';

import { ApiService } from '~/services/apiService';

@Injectable()
export class OperatorService extends ApiService{
  public endPoint = '/operators';

  public messages = {
    created: 'L\'opérateur a bien été crée.',
    deleted: 'L\'opérateur a bien été supprimé.',
    updated: 'L\'opérateur a bien été mis à jour',
  };
}
