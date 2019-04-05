import { Injectable } from '@angular/core';

import { ApiService } from '~/services/apiService';

@Injectable()
export class UserService extends ApiService{
  public endPoint = '/users';

  public messages = {
    created: 'L\'utilisateur a bien été crée.',
    deleted: 'L\'utilisateur a bien été supprimé.',
    updated: 'L\'utilisateur a bien été mis à jour',
  };
}
