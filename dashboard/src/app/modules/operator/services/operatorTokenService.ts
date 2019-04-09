import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';

/*
 * Service to manage application tokens of the operators
 */

@Injectable()
export class OperatorTokenService extends ApiService {
  public endPoint = '/operators/applications';

  public messages = {
    created: 'L\'application a bien été créée.',
    deleted: 'L\'application a bien été supprimée.',
    updated: 'L\'application a bien été mise à jour',
  };
}
